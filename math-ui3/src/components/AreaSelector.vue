<template>
  <v-card
    v-if="show"
    variant="outlined"
    class="selection"
    id="selection"
    v-on:mousedown="startMoving"
    v-on:mouseup="onSelectionMouseUp"
    v-on:mousemove="moveSelectionByMouseDrag"
    v-bind:style="{
      left: selectionRectLeft + 'px',
      top: selectionRectTop + 'px',
      width: selectionRectWidth + 'px',
      height: -15 + selectionRectHeight + 'px',
      background: backgroundColor,
    }"
  >
  </v-card>
  <v-card
    v-if="show"
    variant="outlined"
    class="resizable"
    id="selectionResize"
    v-on:mousedown="startResizing"
    v-on:mouseup="onResizeMouseUp"
    v-on:mousemove="resizeSelectionByMouseDrag"
    v-bind:style="{
      left: selectionRectLeft + 'px',
      top: selectionRectTop + 'px',
      width: selectionRectWidth + 'px',
      height: selectionRectHeight + 'px',
      background: backgroundColor,
    }"
  >
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { NotationType, SelectionMoveDirection } from "common/unions";
import {
  NotationAttributes,
  DotCoordinates,
  RectNotationAttributes,
  isRect,
} from "common/baseTypes";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useSelectionHelper from "../helpers/selectionHelper";
import useEventBusHelper from "../helpers/eventBusHelper";
import useWatchHelper from "../helpers/watchHelper";
import UseAuthorizationHelper from "../helpers/authorizationHelper";
import { get } from "cypress/types/lodash";

type HorizontalDirection = "RIGHT" | "LEFT" | "NONE";
type VerticalDirection = "UP" | "BOTTOM" | "NONE";

let horizontalDirection: HorizontalDirection = "NONE";
let verticalDirection: VerticalDirection = "NONE";

const watchHelper = useWatchHelper();
const eventBus = useEventBusHelper();
const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationMutationHelper = useNotationMutateHelper();
const authorizationHelper = UseAuthorizationHelper();
const notationStore = useNotationStore();
const selectionHelper = useSelectionHelper();

let lineTypes: Array<NotationType> = [
  "CURVE",
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

const selectedRectElement = computed(() => {
  return document.getElementById(getSelectedRect()!.uuid);
});

const selectedRectBoundingRect = computed(() => {
  return selectedRectElement.value?.getBoundingClientRect();
});

const show = computed(() => {
  return (
    (editModeStore.isTextSelectionMode() ||
      editModeStore.isAreaSelectionOrMovingMode() ||
      editModeStore.isResizeMode()) &&
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

watchHelper.watchMouseEvent(
  ["AREA_SELECTED", "RESIZE_STARTED", "RESIZING"],
  "EV_SVG_MOUSEDOWN",
  () => {
    cancelSelectionWhenUserClickedOutside();
  },
);

watchHelper.watchKeyEvent(
  ["AREA_SELECTED"],
  "EV_KEYUP",
  updateSelectionAreaByKey,
);

watchHelper.watchMouseEvent(
  ["AREA_MOVING"],
  "EV_SVG_MOUSEUP",
  endMoveSelection,
);

watchHelper.watchMouseEvent(
  ["AREA_MOVING"],
  "EV_SVG_MOUSEMOVE",
  moveSelectionByMouseDrag,
);

watchHelper.watchMouseEvent(
  ["TEXT_STARTED"],
  "EV_SVG_MOUSEUP",
  cancelTextSelectionWhenUserClickedOutside /*takes action when clicked outside of selection area*/,
);

watchHelper.watchNotationSelection(
  ["TEXT_SELECTED", "IMAGE_SELECTED"],
  "EV_IMAGE_SELECTED",
  selectRectNotation,
);

function getSelectedRect() {
  if (
    notationStore.getSelectedNotations().length > 0 &&
    isRect(notationStore.getSelectedNotations()[0].notationType)
  ) {
    return notationStore.getSelectedNotations()[0] as RectNotationAttributes;
  }
  return null;
}

function startResizing(e: MouseEvent) {
  if (e.buttons !== 1) return;

  if (!authorizationHelper.canEdit()) return;

  editModeStore.setEditMode("RESIZE_STARTED");
}

function resizeSelectionByMouseDrag(e: MouseEvent) {
  if (e.buttons !== 1) return;

  if (!editModeStore.isResizeMode()) return;

  editModeStore.setEditMode("RESIZING");

  verticalDirection = "BOTTOM";
  horizontalDirection = "RIGHT";

  updateSelectionArea(e);
}

async function onResizeMouseUp() {
  editModeStore.setEditMode("AREA_SELECTED");

  let selectedRect = getSelectedRect();

  if (!selectedRect) return;

  selectedRect.fromCol = Math.round(
    (selectionRectLeft.value - cellStore.getSvgBoundingRect().left) /
      cellStore.getCellHorizontalWidth(),
  );

  selectedRect.toCol = Math.round(
    (selectionRectLeft.value +
      selectionRectWidth.value -
      cellStore.getSvgBoundingRect().left) /
      cellStore.getCellHorizontalWidth(),
  );

  getSelectedRect()!.fromRow = Math.round(
    (selectionRectTop.value - cellStore.getSvgBoundingRect().top) /
      cellStore.getCellVerticalHeight(),
  );

  getSelectedRect()!.toRow = Math.round(
    (selectionRectTop.value +
      selectionRectHeight.value -
      cellStore.getSvgBoundingRect().top) /
      cellStore.getCellVerticalHeight(),
  );

  await notationMutationHelper.updateNotation(getSelectedRect()!);
}

function cancelSelectionWhenUserClickedOutside() {
  notationStore.resetSelectedNotations();
  resetSelectionPosition();
  editModeStore.setDefaultEditMode();
}

function cancelTextSelectionWhenUserClickedOutside() {
  notationStore.resetSelectedNotations();
  resetSelectionPosition();
  editModeStore.setDefaultEditMode();
}

function startAreaSelection(e: MouseEvent) {
  if (e.buttons !== 1) return;

  if (!authorizationHelper.canEdit()) return;

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
  editModeStore.setNextEditMode();
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

  setSelectionDirection(e);

  if (horizontalDirection === "NONE" || verticalDirection === "NONE") {
    return;
  }

  if (horizontalDirection === "LEFT") {
    selectionPosition.value.x1 = e.pageX;
  }

  if (horizontalDirection === "RIGHT") {
    selectionPosition.value.x2 = e.pageX;
  }

  if (verticalDirection === "UP") {
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
      topLeft: {
        x: selectionPosition.value.x1 - cellStore.getSvgBoundingRect().left,
        y: selectionPosition.value.y1 - cellStore.getSvgBoundingRect().top,
      },
      bottomRight: {
        x: selectionPosition.value.x2 - cellStore.getSvgBoundingRect().left,
        y: selectionPosition.value.y2 - cellStore.getSvgBoundingRect().top,
      },
    });
  }

  if (editModeStore.getEditMode() === "TEXT_AREA_SELECTING") {
    signalSelection();
  }

  console.debug(
    `selecting # ${notationStore.getSelectedNotations().length}  notations`,
  );

  editModeStore.setNextEditMode();
}

function moveSelectionByMouseDrag(e: MouseEvent) {
  if (e.buttons !== 1) return;

  if (editModeStore.getEditMode() !== "AREA_MOVING") {
    return;
  }

  // initial drag position
  if (!dragPosition.value.x) {
    dragPosition.value.x = e.pageX;
    dragPosition.value.y = e.pageY;
    console.debug("initial drag");
    return;
  }

  if (onlyLinesOrCircleAraSelected()) {
    moveAtPixelScale(e);
  } else {
    moveAtCellScale(e);
  }
}

function onlyLinesOrCircleAraSelected() {
  return (
    notationStore
      .getSelectedNotations()
      .filter((n) => !lineTypes.includes(n.notationType)).length == 0
  );
}

function moveAtCellScale(e: MouseEvent) {
  const deltaCol = Math.round(
    (e.pageX - dragPosition.value.x) / cellStore.getCellHorizontalWidth(),
  );

  const deltaRow = Math.round(
    (e.pageY - dragPosition.value.y) / cellStore.getCellVerticalHeight(),
  );

  if (Math.abs(deltaCol) > 0 || Math.abs(deltaRow) > 0) {
    notationMutationHelper.moveSelectedNotations(
      deltaCol * cellStore.getCellHorizontalWidth(),
      deltaRow * cellStore.getCellVerticalHeight(),
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

async function moveSelectionByKey(
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

async function onSelectionMouseUp(e: MouseEvent) {
  if (editModeStore.getEditMode() === "AREA_SELECTING") {
    endSelect();
    return;
  }

  endMoveSelection(e);
}

async function endMoveSelection(e: MouseEvent) {
  const moveDirection: SelectionMoveDirection =
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

// signal free text editor
function signalSelection() {
  eventBus.emit("EV_AREA_SELECTION_DONE", {
    left: selectionRectLeft.value,
    top: selectionRectTop.value,
    width: selectionRectWidth.value,
    height: selectionRectHeight.value,
  });
}

function selectRectNotation(): void {
  if (getSelectedRect()!.notationType === "IMAGE") {
    setSelectionPositionForImage(getSelectedRect()!);
  }

  if (getSelectedRect()!.notationType === "TEXT") {
    setSelectionPositionForText(getSelectedRect() as RectNotationAttributes);
  }

  editModeStore.setEditMode("AREA_SELECTED");
}

function setSelectionPositionForText(selectedNotation: RectNotationAttributes) {
  selectionPosition.value.x1 =
    cellStore.getSvgBoundingRect().left +
    selectedNotation.fromCol * cellStore.getCellHorizontalWidth();
  selectionPosition.value.x2 =
    cellStore.getSvgBoundingRect().left +
    selectedNotation.toCol * cellStore.getCellHorizontalWidth();
  selectionPosition.value.y1 =
    cellStore.getSvgBoundingRect().top +
    selectedNotation.fromRow * cellStore.getCellVerticalHeight();
  selectionPosition.value.y2 =
    cellStore.getSvgBoundingRect().top +
    selectedNotation.toRow * cellStore.getCellVerticalHeight();
}

function setSelectionPositionForImage(selectedNotation: NotationAttributes) {
  const rect = selectedRectBoundingRect.value!;

  selectionPosition.value.x1 = rect.x;
  selectionPosition.value.x2 = rect.x + rect.width;
  selectionPosition.value.y1 = rect.y;
  selectionPosition.value.y2 = rect.y + rect.height;
}
</script>

<style>
.resizable {
  padding: 5px;
  display: inline-block;
  position: absolute;
  resize: both;
  overflow: hidden;
  line-height: 0;
}

.resizable img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.selection {
  cursor: move; /*fallback if grab cursor is unsupported */
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
  position: absolute;
  z-index: 99;
  border-bottom: 0;
}
</style>
