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
import { RectCoordinates, DotCoordinates } from "common/baseTypes";
import useEventBusHelper from "../helpers/eventBusHelper";
import useWatchHelper from "../helpers/watchHelper";

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

let selectionPosition = ref<RectCoordinates>({
  topLeft: { x: 0, y: 0 },
  bottomRight: { x: 0, y: 0 },
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
    selectionPosition.value.topLeft.x !=
      selectionPosition.value.bottomRight.x &&
    selectionPosition.value.topLeft.y != selectionPosition.value.bottomRight.y
  );
});

const backgroundColor = computed(() => {
  return editModeStore.isTextSelectionMode() ? "lightyellow" : "transparent";
});

const selectionRectLeft = computed(() => {
  return Math.min(
    selectionPosition.value.topLeft.x,
    selectionPosition.value.bottomRight.x,
  );
});

const selectionRectTop = computed(() => {
  return Math.min(
    selectionPosition.value.topLeft.y,
    selectionPosition.value.bottomRight.y,
  );
});

const selectionRectWidth = computed(() => {
  return (
    Math.max(
      selectionPosition.value.topLeft.x,
      selectionPosition.value.bottomRight.x,
    ) -
    Math.min(
      selectionPosition.value.topLeft.x,
      selectionPosition.value.bottomRight.x,
    )
  );
});

const selectionRectHeight = computed(() => {
  return (
    Math.max(
      selectionPosition.value.topLeft.y,
      selectionPosition.value.bottomRight.y,
    ) -
    Math.min(
      selectionPosition.value.topLeft.y,
      selectionPosition.value.bottomRight.y,
    )
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
  selectionPosition.value.bottomRight.x = selectionPosition.value.topLeft.x =
    e.pageX;

  selectionPosition.value.bottomRight.y = selectionPosition.value.topLeft.y =
    e.pageY;
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

// extend or shrink selection area following inner mouse move
function updateSelectionArea(e: MouseEvent) {
  if (e.buttons !== 1) return;

  if (e.pageX > selectionPosition.value.topLeft.x) {
    selectionPosition.value.bottomRight.x = e.pageX;
  } else {
    selectionPosition.value.topLeft.x = e.pageX;
  }

  if (e.pageY > selectionPosition.value.topLeft.y) {
    selectionPosition.value.bottomRight.y = e.pageY;
  } else {
    selectionPosition.value.topLeft.y = e.pageY;
  }
}

function endSelect() {
  // select cell if seelection is too small
  if (
    Math.abs(
      selectionPosition.value.topLeft.x - selectionPosition.value.bottomRight.x,
    ) < 5 ||
    Math.abs(
      selectionPosition.value.topLeft.y - selectionPosition.value.bottomRight.y,
    ) < 5
  ) {
    selectionHelper.setSelectedCell({
      x: selectionPosition.value.topLeft.x,
      y: selectionPosition.value.topLeft.y,
    });
    editModeStore.setDefaultEditMode();
    return;
  }

  if (editModeStore.getEditMode() === "AREA_SELECTING") {
    selectionHelper.selectNotationsOfArea(selectionPosition.value);
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

  selectionPosition.value.topLeft.x += xMove;
  selectionPosition.value.topLeft.y += yMove;

  selectionPosition.value.bottomRight.x += xMove;
  selectionPosition.value.bottomRight.y += yMove;

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

    selectionPosition.value.topLeft.x += deltaX;
    selectionPosition.value.topLeft.y += deltaY;
    selectionPosition.value.bottomRight.x += deltaX;
    selectionPosition.value.bottomRight.y += deltaY;

    dragPosition.value.x += deltaX;
    dragPosition.value.y += deltaY;
  }
}

async function moveSelectionByKey( ///TODO by cell or pixel
  moveHorizontal: number,
  moveVertical: number,
) {
  selectionPosition.value.topLeft.x +=
    moveHorizontal * cellStore.getCellHorizontalWidth();
  selectionPosition.value.topLeft.y +=
    moveVertical * cellStore.getCellVerticalHeight();
  selectionPosition.value.bottomRight.x +=
    moveHorizontal * cellStore.getCellHorizontalWidth();
  selectionPosition.value.bottomRight.y +=
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
    selectionPosition.value.topLeft.x =
    selectionPosition.value.bottomRight.x =
    selectionPosition.value.topLeft.y =
    selectionPosition.value.bottomRight.y =
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
