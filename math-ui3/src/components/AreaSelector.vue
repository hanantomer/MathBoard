<template>
  <v-card
    v-if="show"
    variant="outlined"
    id="selection"
    class="selection"
    v-bind:style="{
      left: selectionRectLeft + 'px',
      top: selectionRectTop + 'px',
      width: selectionRectWidth + 'px',
      height: selectionRectHeight + 'px',
      background: backgroundColor,
    }"
    v-on:mouseup="mouseup"
    v-on:mousemove="mousemove"
    v-on:mouseenter="enter"
    v-on:mouseleave="leave"
  ></v-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";

import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useSelectionHelper from "../helpers/selectionHelper";
import { MoveDirection, NotationType } from "common/unions";
import { DotCoordinates } from "common/baseTypes";
import useEventBusHelper from "../helpers/eventBusHelper";
import useWatchHelper from "../helpers/watchHelper";

type HorizontalDirection = "RIGHT" | "LEFT" | "NONE";
type VerticalDirection = "UP" | "BOTTOM" | "NONE";

let horizontalDirection: HorizontalDirection = "NONE";
let verticalDirection: VerticalDirection = "NONE";

const watchHelper = useWatchHelper();
const eventBus = useEventBusHelper();
const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationStore = useNotationStore();
const notationMutationHelper = useNotationMutateHelper();
const selectionHelper = useSelectionHelper();

// variables

let mouseOverSelectionArea: boolean = false;
let mouseLeftSelectionArea: boolean = false;

let lineTypes: Array<NotationType> = [
  "CONCAVECURVE",
  "CONCAVECURVE",
  "HORIZONTALLINE",
  "VERTICALLINE",
  "SLOPELINE",
];

let selectionPosition = ref({
  x1: 0, //left
  x2: 0, // right
  y1: 0, // y of left
  y2: 0, // y of right
});

let dragPosition = ref<DotCoordinates>({
  x: 0,
  y: 0,
});

// computed

const show = computed(() => {
  return (
    (editModeStore.isTextSelectionMode() ||
      editModeStore.isAreaSelectionOrMovingMode()) &&
    selectionPosition.value.x1 != selectionPosition.value.x2 &&
    selectionPosition.value.y1 != selectionPosition.value.y2
  );
});

const backgroundColor = computed(() => {
  return editModeStore.isTextSelectionMode() ? "lightyellow" : "transparent";
});

const selectionRectLeft = computed(() => {
  return Math.min(selectionPosition.value.x1, selectionPosition.value.x2);
});

const selectionRectTop = computed(() => {
  return Math.min(selectionPosition.value.y1, selectionPosition.value.y2);
});

const selectionRectWidth = computed(() => {
  return (
    Math.max(selectionPosition.value.x1, selectionPosition.value.x2) -
    Math.min(selectionPosition.value.x1, selectionPosition.value.x2)
  );
});

const selectionRectHeight = computed(() => {
  return (
    Math.max(selectionPosition.value.y1, selectionPosition.value.y2) -
    Math.min(selectionPosition.value.y1, selectionPosition.value.y2)
  );
});

// area selection watchers

watchHelper.watchMouseEvent(
  ["SYMBOL", "CELL_SELECTED"],
  "EV_SVG_MOUSEMOVE",
  startAreaSelection,
);

watchHelper.watchMouseEvent(
  ["TEXT_STARTED"],
  "EV_SVG_MOUSEMOVE",
  startAreaSelection,
);

watchHelper.watchMouseEvent(
  ["AREA_SELECTING", "TEXT_AREA_SELECTING"],
  "EV_SVG_MOUSEMOVE",
  updateSelectionArea,
);

watchHelper.watchMouseEvent(
  ["AREA_SELECTING", "TEXT_AREA_SELECTING"],
  "EV_SVG_MOUSEUP",
  endSelect,
);

watchHelper.watchKeyEvent(
  ["AREA_SELECTED"],
  "EV_KEYUP",
  updateSelectionAreaByKey,
);

watchHelper.watchMouseEvent(["AREA_SELECTED"], "EV_SVG_MOUSEMOVE", startMoving);

watchHelper.watchMouseEvent(
  ["AREA_MOVING"],
  "EV_SVG_MOUSEMOVE",
  moveSelectionByMouseDrag,
);

watchHelper.watchMouseEvent(
  ["AREA_MOVING"],
  "EV_SVG_MOUSEUP",
  endMoveSelection,
);

watchHelper.watchMouseEvent(
  ["AREA_SELECTED"],
  "EV_SVG_MOUSEUP",
  cancelSelectionWhenUserClickedOutside /*takes action when clicked outside of selection area*/,
);

watchHelper.watchMouseEvent(
  ["TEXT_STARTED"],
  "EV_SVG_MOUSEUP",
  cancelTextSelectionWhenUserClickedOutside /*takes action when clicked outside of selection area*/,
);

//watchHelper.watchMouseEvent(["TEXT_STARTED"], "EV_SVG_MOUSEDOWN", () =>
//  editModeStore.setNextEditMode(),
//);

function cancelSelectionWhenUserClickedOutside() {
  notationStore.resetSelectedNotations();
  resetSelectionPosition();
  editModeStore.setDefaultEditMode();
}

function cancelTextSelectionWhenUserClickedOutside() {
  if (!mouseLeftSelectionArea) return;
  notationStore.resetSelectedNotations();
  resetSelectionPosition();
  editModeStore.setDefaultEditMode();
}

function startAreaSelection(e: MouseEvent) {
  if (e.buttons !== 1) return;

  horizontalDirection = "NONE";
  verticalDirection = "NONE";

  notationStore.resetSelectedNotations();

  resetSelectionPosition();

  setStartPosition(e);

  editModeStore.setEditMode(
    editModeStore.getEditMode() === "TEXT_STARTED"
      ? "TEXT_AREA_SELECTING"
      : "AREA_SELECTING",
  );
}

function setStartPosition(e: MouseEvent) {
  selectionPosition.value.x2 = selectionPosition.value.x1 = e.pageX;

  selectionPosition.value.y2 = selectionPosition.value.y1 = e.pageY;
}

function startMoving(e: MouseEvent) {
  if (e.buttons !== 1) return;
  if (!mouseOverSelectionArea) return;
  editModeStore.setNextEditMode();
}

function enter() {
  mouseOverSelectionArea = true;
  mouseLeftSelectionArea = false;
}

function leave() {
  mouseLeftSelectionArea = true;
}

function mouseup(e: MouseEvent) {
  eventBus.emit("EV_SVG_MOUSEUP", e);
}

function mousemove(e: MouseEvent) {
  eventBus.emit("EV_SVG_MOUSEMOVE", e);
}

async function updateSelectionAreaByKey(e: KeyboardEvent) {
  if (selectionRectHeight.value === 0) return;

  switch (e.code) {
    case "Delete":
      notationMutationHelper.deleteSelectedNotations();
      editModeStore.setDefaultEditMode();
    case "ArrowLeft":
      if (
        !notationMutationHelper.moveSelectedNotationsAtCellScale(
          -1,
          0,
          e.ctrlKey,
        )
      )
        return;
      await moveSelectionByKey(-1, 0);
      await notationMutationHelper.saveMovedNotations("LEFT");
      break;
    case "ArrowRight":
      if (
        !notationMutationHelper.moveSelectedNotationsAtCellScale(
          1,
          0,
          e.ctrlKey,
        )
      )
        return;
      moveSelectionByKey(1, 0);
      await notationMutationHelper.saveMovedNotations("RIGHT");
      break;
    case "ArrowDown":
      if (
        !notationMutationHelper.moveSelectedNotationsAtCellScale(
          0,
          1,
          e.ctrlKey,
        )
      )
        return;
      moveSelectionByKey(0, 1);
      await notationMutationHelper.saveMovedNotations("BOTTOM");
      break;
    case "ArrowUp":
      if (
        !notationMutationHelper.moveSelectedNotationsAtCellScale(
          0,
          -1,
          e.ctrlKey,
        )
      )
        return;
      moveSelectionByKey(0, -1);
      await notationMutationHelper.saveMovedNotations("TOP");
      break;
  }
}

// extend or shrink selection area
function updateSelectionArea(e: MouseEvent) {
  if (e.buttons !== 1) return;

  setSelectionDirection(e)

  if (horizontalDirection === "NONE" || verticalDirection === "NONE") {
    return;
  }

  if (horizontalDirection === "LEFT" ) {
    selectionPosition.value.x1 = e.pageX;
  }

  if (horizontalDirection === "RIGHT" ) {
    selectionPosition.value.x2 = e.pageX;
  }

  if (verticalDirection === "UP" ) {
    selectionPosition.value.y1 = e.pageY;
  }

  if (verticalDirection === "BOTTOM") {
    selectionPosition.value.y2 = e.pageY;
  }
}

function setSelectionDirection(e: MouseEvent) {

    if (horizontalDirection === "NONE") {
    if (e.pageX > selectionPosition.value.x1) {
      horizontalDirection = "RIGHT";
      return;
    }

    if (e.pageX < selectionPosition.value.x1) {
      horizontalDirection = "LEFT";
      return;
    }
  }

  if (verticalDirection === "NONE") {
    if (e.pageY > selectionPosition.value.y1) {
      verticalDirection = "BOTTOM";
      return;
    }

    if (e.pageY < selectionPosition.value.y1) {
      verticalDirection = "UP";
      return;
    }
  }
}

function endSelect() {
  // select cell if seelection is too small
  if (
    Math.abs(selectionPosition.value.x1 - selectionPosition.value.x2) < 5 ||
    Math.abs(selectionPosition.value.y1 - selectionPosition.value.y2) < 5
  ) {
    selectionHelper.setSelectedCell({
      x: selectionPosition.value.x1,
      y: selectionPosition.value.y1,
    });
    editModeStore.setDefaultEditMode();
    return;
  }

  if (editModeStore.getEditMode() === "AREA_SELECTING") {
    selectionHelper.selectNotationsOfArea({
      topLeft: { x: selectionPosition.value.x1, y: selectionPosition.value.y1 },
      bottomRight: {
        x: selectionPosition.value.x2,
        y: selectionPosition.value.y2,
      },
    });
  }

  if (editModeStore.getEditMode() === "TEXT_AREA_SELECTING") {
    signalSelection();
  }

  console.debug("selecting #");
  console.debug(notationStore.getSelectedNotations().length);

  editModeStore.setNextEditMode();
}

function moveSelectionByMouseDrag(e: MouseEvent) {
  if (e.buttons !== 1) return;

  if (!mouseOverSelectionArea) return;
  //  if (mouseLeftSelectionArea) return;

  // initial drag position
  if (!dragPosition.value.x) {
    dragPosition.value.x = e.pageX;
    dragPosition.value.y = e.pageY;
    console.debug("initial drag");
    return;
  }

  if (onlyLinesAraSelected()) {
    moveAtPixelScale(e);
  } else {
    moveAtCellScale(e);
  }
}

function onlyLinesAraSelected() {
  return (
    notationStore
      .getSelectedNotations()
      .filter((n) => !lineTypes.includes(n.notationType)).length == 0
  );
}

function moveAtCellScale(e: MouseEvent) {
  const deltaX = e.pageX - dragPosition.value.x;
  const deltaY = e.pageY - dragPosition.value.y;

  const deltaCol = Math.round(
    (e.pageX - dragPosition.value.x) / cellStore.getCellHorizontalWidth(),
  );

  const deltaRow = Math.round(
    (e.pageY - dragPosition.value.y) / cellStore.getCellVerticalHeight(),
  );

  if (Math.abs(deltaCol) > 0 || Math.abs(deltaRow) > 0) {
    notationMutationHelper.moveSelectedNotations(
      deltaX,
      deltaY,
      deltaCol,
      deltaRow,
      e.ctrlKey,
    );

    moveSelectionBox(deltaCol, deltaRow);
  }
}

function moveSelectionBox(deltaCol: number, deltaRow: number) {
  const xMove = deltaCol * cellStore.getCellHorizontalWidth();
  const yMove = deltaRow * cellStore.getCellVerticalHeight();

  selectionPosition.value.x1 += xMove;
  selectionPosition.value.y1 += yMove;

  selectionPosition.value.x2 += xMove;
  selectionPosition.value.y2 += yMove;

  dragPosition.value.x += xMove;
  dragPosition.value.y += yMove;
}

function moveAtPixelScale(e: MouseEvent) {
  const deltaX = e.pageX - dragPosition.value.x;
  const deltaY = e.pageY - dragPosition.value.y;

  if (deltaX != 0 || deltaY != 0) {
    notationMutationHelper.moveSelectedNotations(
      deltaX,
      deltaY,
      0,
      0,
      e.ctrlKey,
    );

    selectionPosition.value.x1 += deltaX;
    selectionPosition.value.y1 += deltaY;
    selectionPosition.value.x2 += deltaX;
    selectionPosition.value.y2 += deltaY;

    dragPosition.value.x += deltaX;
    dragPosition.value.y += deltaY;
  }
}

async function moveSelectionByKey( ///TODO by cell or pixel
  moveHorizontal: number,
  moveVertical: number,
) {
  selectionPosition.value.x1 +=
    moveHorizontal * cellStore.getCellHorizontalWidth();
  selectionPosition.value.y1 +=
    moveVertical * cellStore.getCellVerticalHeight();
  selectionPosition.value.x2 +=
    moveHorizontal * cellStore.getCellHorizontalWidth();
  selectionPosition.value.y2 +=
    moveVertical * cellStore.getCellVerticalHeight();
}

async function endMoveSelection(e: MouseEvent) {
  const moveDirection: MoveDirection =
    e.movementX > 0 && e.movementY > 0
      ? "RIGHTBOTTOM"
      : e.movementX > 0 && e.movementY < 0
      ? "RIGHTTOP"
      : e.movementX > 0 && e.movementY === 0
      ? "RIGHT"
      : e.movementX < 0 && e.movementY > 0
      ? "LEFTBOTTOM"
      : e.movementX < 0 && e.movementY < 0
      ? "LEFTTOP"
      : "LEFT";

  await notationMutationHelper.saveMovedNotations(moveDirection);
  notationStore.resetSelectedNotations();
  resetSelectionPosition();
  editModeStore.setDefaultEditMode();
}

function resetSelectionPosition() {
  dragPosition.value.x =
    dragPosition.value.y =
    selectionPosition.value.x1 =
    selectionPosition.value.x2 =
    selectionPosition.value.y1 =
    selectionPosition.value.y2 =
      0;
}

function signalSelection() {
  eventBus.emit("EV_AREA_SELECTION_DONE", {
    left: selectionRectLeft.value,
    top: selectionRectTop.value,
    width: selectionRectWidth.value,
    height: selectionRectHeight.value,
  });
}
</script>

<style>
.selection {
  cursor: move; /*fallback if grab cursor is unsupported */
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
  position: absolute;
  z-index: 99;
  border: 1, 1, 1, 1;
}
</style>
