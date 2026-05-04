<template>
  <v-card
    v-if="show"
    variant="outlined"
    class="selection"
    id="selection"
    data-cy="area-selection"
    v-on:mouseup="onSelectionMouseUp"
    v-on:mousemove="onSelectionMouseDrag"
    v-bind:style="{
      left: selectionRectLeft + 'px',
      top: selectionRectTop + 'px',
      width: selectionRectWidth + 'px',
      height: selectionRectHeight + 'px',
      background: backgroundColor,
      transform: `rotate(${selectionRotation}deg)`,
      transformOrigin: 'center center',
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
  RectCoordinates,
  DotCoordinates,
  RectNotationAttributes,
  isRect,
  AnnotationNotationAttributes,
} from "common/baseTypes";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useSelectionHelper from "../helpers/selectionHelper";
import useEventBusHelper from "../helpers/eventBusHelper";
import useWatchHelper from "../helpers/watchHelper";
import UseAuthorizationHelper from "../helpers/authorizationHelper";
import useScreenHelper from "../helpers/screenHelper";

const screenHelper = useScreenHelper();
type HorizontalDirection = "RIGHT" | "LEFT" | "NONE";
type VerticalDirection = "UP" | "BOTTOM" | "NONE";

const selectionRotation = ref(0);

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
  "CIRCLE",
  "LINE",
  "ANNOTATION",
  "FREESKETCH",
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

let dragStarted = false;

// computed

const selectedRectElement = computed(() => {
  return document.getElementById(getSelectedRect()!.uuid);
});

const selectedRectBoundingRect = computed(() => {
  return selectedRectElement.value?.getBoundingClientRect();
});

const show = computed(() => {
  return (
    (editModeStore.isAnnotationSelectedMode() ||
      editModeStore.isImageSelectedMode() ||
      editModeStore.isTextSelectedMode() ||
      editModeStore.isTextSelectionMode() ||
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
  ["CELL_SELECTED"],
  "EV_SVG_MOUSE_DRAG",
  startAreaSelection,
);

watchHelper.watchTouchEvent(
  ["AREA_SELECTION_STARTED"],
  "EV_SVG_TOUCHSTART",
  startAreaSelection,
);


watchHelper.watchMouseEvent(
  ["TEXT_STARTED"],
  "EV_SVG_MOUSE_DRAG",
  startAreaSelection,
);

watchHelper.watchTouchEvent(
  ["TEXT_STARTED"],
  "EV_SVG_TOUCHSTART",
  startAreaSelection,
);

watchHelper.watchMouseEvent(
  ["AREA_SELECTION_STARTED", "TEXT_AREA_SELECTING"],
  "EV_SVG_MOUSE_DRAG",
  updateSelectionArea,
);

watchHelper.watchTouchEvent(
  ["AREA_SELECTION_STARTED", "TEXT_AREA_SELECTING"],
  "EV_SVG_TOUCHMOVE",
  updateSelectionArea,
);

watchHelper.watchMouseEvent(
  ["TEXT_SELECTED"],
  "EV_TEXT_SELECTED",
  selectRectNotation,
);

watchHelper.watchNotationSelection(
  ["IMAGE_SELECTED"],
  "EV_IMAGE_SELECTED",
  selectRectNotation,
);

watchHelper.watchMouseEvent(
  ["AREA_SELECTION_STARTED", "TEXT_AREA_SELECTING", "RESIZING"],
  "EV_SVG_MOUSEUP",
  endSelect,
);

watchHelper.watchTouchEvent(
  ["AREA_SELECTION_STARTED", "TEXT_AREA_SELECTING", "RESIZING"],
  "EV_SVG_TOUCHEND",
  endSelect,
);

watchHelper.watchMouseEvent(
  ["AREA_SELECTION_STARTED", "TEXT_AREA_SELECTING", "RESIZING"],
  "EV_MOUSEUP",
  endSelect,
);

watchHelper.watchMouseEvent(
  ["AREA_SELECTED", "RESIZE_STARTED", "RESIZING"],
  "EV_SVG_MOUSEDOWN",
  cancelSelectionWhenUserClickedOutside,
);

watchHelper.watchKeyEvent(["AREA_SELECTED"], "EV_KEYUP", handleKeyUp);

watchHelper.watchMouseEvent(
  ["AREA_SELECTED", "IMAGE_SELECTED", "TEXT_SELECTED", "ANNOTATION_SELECTED"],
  "EV_SVG_MOUSE_DRAG",
  startMmoveSelectedNotations,
);

watchHelper.watchMouseEvent(
  ["AREA_MOVING"],
  "EV_SVG_MOUSE_DRAG",
  moveSelectedNotations,
);

watchHelper.watchMouseEvent(
  ["AREA_MOVING"],
  "EV_SVG_MOUSEUP",
  endMoveSelection,
);

watchHelper.watchMouseEvent(["AREA_MOVING"], "EV_MOUSEUP", endMoveSelection);

watchHelper.watchMouseEvent(["AREA_MOVING"], "EV_TOUCHEEND", endMoveSelection);

watchHelper.watchMouseEvent(
  ["TEXT_STARTED", "IMAGE_SELECTED"],
  "EV_SVG_MOUSEUP",
  cancelTextSelectionWhenUserClickedOutside /*takes action when clicked outside of selection area*/,
);

watchHelper.watchNotationSelection(
  ["ANNOTATION_SELECTED"],
  "EV_ANNOTATION_SELECTED",
  selectAnnotation,
);

function startMmoveSelectedNotations(e: MouseEvent) {
  if (!e.buttons) return;
  editModeStore.setEditMode("AREA_MOVING");
}

function getSelectedRect() {
  if (
    notationStore.getSelectedNotations().length > 0 &&
    isRect(notationStore.getSelectedNotations()[0].notationType)
  ) {
    return notationStore.getSelectedNotations()[0] as RectNotationAttributes;
  }
  return null;
}

function getSelectedAnnotation() {
  if (notationStore.getSelectedNotations().length > 0) {
    return notationStore.getSelectedNotations()[0] as AnnotationNotationAttributes;
  }
  return null;
}

function cancelSelectionWhenUserClickedOutside() {
  notationStore.resetSelectedNotations();
  resetSelectionPosition();
  editModeStore.setDefaultEditMode();
}

function cancelTextSelectionWhenUserClickedOutside(e: MouseEvent) {
  e.stopPropagation();
  notationStore.resetSelectedNotations();
  resetSelectionPosition();
  editModeStore.setDefaultEditMode();
}

function startAreaSelection(e: MouseEvent | TouchEvent) {
  if (!authorizationHelper.canEdit()) return;

  if (editModeStore.getGlobalEditMode() === "FREE_SKETCH") {
    return;
  }

  horizontalDirection = "NONE";
  verticalDirection = "NONE";

  notationStore.resetSelectedNotations();

  resetSelectionPosition();

  setStartPosition(e);

  editModeStore.setEditMode(
    editModeStore.getEditMode() === "TEXT_STARTED"
      ? "TEXT_AREA_SELECTING"
      : "AREA_SELECTION_STARTED",
  );
}

function setStartPosition(e: MouseEvent | TouchEvent) {
  const pageX = "touches" in e ? e.touches[0].pageX : e.pageX;
  const pageY = "touches" in e ? e.touches[0].pageY : e.pageY;
  selectionPosition.value.x2 = selectionPosition.value.x1 = pageX;
  selectionPosition.value.y2 = selectionPosition.value.y1 = pageY;
}

async function handleKeyUp(e: KeyboardEvent) {
  if (selectionRectHeight.value === 0) return;

  switch (e.code) {
    case "Backspace":
    case "Delete":
      notationMutationHelper.deleteSelectedNotations();
      editModeStore.setDefaultEditMode();
      break;
    case "ArrowLeft":
      if (
        !notationMutationHelper.moveSelectedNotationsAtCellScale(-1, 0, false)
      )
        return;
      await moveSelectionByKey(-1, 0);
      await notationMutationHelper.saveMovedNotations("LEFT");
      break;
    case "ArrowRight":
      if (!notationMutationHelper.moveSelectedNotationsAtCellScale(1, 0, false))
        return;
      await moveSelectionByKey(1, 0);
      await notationMutationHelper.saveMovedNotations("RIGHT");
      break;
    case "ArrowDown":
      if (!notationMutationHelper.moveSelectedNotationsAtCellScale(0, 1, false))
        return;
      await moveSelectionByKey(0, 1);
      await notationMutationHelper.saveMovedNotations("BOTTOM");
      break;
    case "ArrowUp":
      if (
        !notationMutationHelper.moveSelectedNotationsAtCellScale(0, -1, false)
      )
        return;
      await moveSelectionByKey(0, -1);
      await notationMutationHelper.saveMovedNotations("TOP");
      break;
  }
}

// extend or shrink selection area
function updateSelectionArea(e: MouseEvent | TouchEvent) {
  if (!authorizationHelper.canEdit()) return;
  setSelectionDirection(e);

  const pageX = "touches" in e ? e.touches[0].pageX : e.pageX;
  const pageY = "touches" in e ? e.touches[0].pageY : e.pageY;

  if (horizontalDirection === "NONE" || verticalDirection === "NONE") {
    return;
  }

  if (horizontalDirection === "LEFT") {
    selectionPosition.value.x1 = pageX;
  }

  if (horizontalDirection === "RIGHT") {
    selectionPosition.value.x2 = pageX;
  }

  if (verticalDirection === "UP") {
    selectionPosition.value.y1 = pageY;
  }

  if (verticalDirection === "BOTTOM") {
    selectionPosition.value.y2 = pageY;
  }
}

function setSelectionDirection(e: MouseEvent | TouchEvent) {
  if (horizontalDirection === "NONE") {
    if (
      ("touches" in e ? e.touches[0].pageX : e.pageX) >
      selectionPosition.value.x1
    ) {
      horizontalDirection = "RIGHT";
      return;
    }

    if (
      ("touches" in e ? e.touches[0].pageX : e.pageX) <
      selectionPosition.value.x1
    ) {
      horizontalDirection = "LEFT";
      return;
    }
  }

  if (verticalDirection === "NONE") {
    if (
      ("touches" in e ? e.touches[0].pageY : e.pageY) >
      selectionPosition.value.y1
    ) {
      verticalDirection = "BOTTOM";
      return;
    }

    if (
      ("touches" in e ? e.touches[0].pageY : e.pageY) <
      selectionPosition.value.y1
    ) {
      verticalDirection = "UP";
      return;
    }
  }
}

function endSelect(e: MouseEvent | TouchEvent) {
  console.debug(
    `end select edit mode is: ${editModeStore.getEditMode()} horizontalDirection: ${horizontalDirection} verticalDirection: ${verticalDirection}`,
  );

  if (editModeStore.getEditMode() === "TEXT_WRITING") {
    return;
  }

  e.stopPropagation();
  // select cell if seelection is too small
  if (
    Math.abs(selectionPosition.value.x1 - selectionPosition.value.x2) < 5 ||
    Math.abs(selectionPosition.value.y1 - selectionPosition.value.y2) < 5
  ) {
    let clickedCell = screenHelper.getCellByDotCoordinates({
      x: selectionPosition.value.x1,
      y: selectionPosition.value.y1,
    });
    if (!clickedCell) return;

    editModeStore.setDefaultEditMode();
    return;
  }

  if (editModeStore.getEditMode() === "AREA_SELECTION_STARTED") {
    selectionHelper.selectNotationsOfArea({
      topLeft: {
        x: selectionRectLeft.value - cellStore.getSvgBoundingRect().left,
        y: selectionRectTop.value - cellStore.getSvgBoundingRect().top,
      },
      bottomRight: {
        x:
          selectionRectLeft.value +
          selectionRectWidth.value -
          cellStore.getSvgBoundingRect().left,
        y:
          selectionRectTop.value +
          selectionRectHeight.value -
          cellStore.getSvgBoundingRect().top,
      },
    });

    if (notationStore.getSelectedNotations().length === 0) {
      editModeStore.setDefaultEditMode();
      return;
    }
  }

  if (editModeStore.getEditMode() === "TEXT_AREA_SELECTING") {
    signalSelection();
    editModeStore.setEditMode("TEXT_WRITING");
    return;
  }

  console.debug(
    `selecting # ${notationStore.getSelectedNotations().length}  notations`,
  );

  editModeStore.setEditMode("AREA_SELECTED");
}

function onSelectionMouseDrag(e: MouseEvent) {
  eventBus.emit("EV_SVG_MOUSE_DRAG", e);
}

async function onSelectionMouseUp(e: MouseEvent) {
  eventBus.emit("EV_SVG_MOUSEUP", e);
}

function moveSelectedNotations(e: MouseEvent) {
  if (!e.buttons) return;
  // initial drag position
  if (!dragPosition.value.x) {
    dragPosition.value.x = e.pageX;
    dragPosition.value.y = e.pageY;
    return;
  }

  if (onlyLinesAnnotationsOrCircleAraSelected()) {
    moveAtPixelScale(e);
  } else {
    moveAtCellScale(e);
  }
}

function onlyLinesAnnotationsOrCircleAraSelected() {
  return (
    notationStore
      .getSelectedNotations()
      .filter((n: any) => !lineTypes.includes(n.notationType)).length == 0
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
    // clone only at start of dragging
    const doClone = e.ctrlKey && !dragStarted;
    dragStarted = true;
    if (
      notationMutationHelper.moveSelectedNotationsAtCellScale(
        deltaCol,
        deltaRow,
        doClone,
      )
    ) {
      moveSelectionBox(deltaCol, deltaRow);
    }
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
    const doClone = e.ctrlKey && !dragStarted;
    dragStarted = true;
    notationMutationHelper.moveSelectedNotationsAtPixelScale(
      deltaX,
      deltaY,
      doClone,
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

async function endMoveSelection(e: MouseEvent) {
  e.stopPropagation();
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

  notationMutationHelper.saveMovedNotations(moveDirection);
  notationStore.resetSelectedNotations();
  resetSelectionPosition();
  editModeStore.setDefaultEditMode();
}

function resetSelectionPosition() {
  dragStarted = false;
  dragPosition.value.x =
    dragPosition.value.y =
    selectionPosition.value.x1 =
    selectionPosition.value.x2 =
    selectionPosition.value.y1 =
    selectionPosition.value.y2 =
      0;

  selectionRotation.value = 0;
}

// signal free text editor
function signalSelection() {
  const coordinates: RectCoordinates = {
    topLeft: {
      x: selectionRectLeft.value,
      y: selectionRectTop.value,
    },
    bottomRight: {
      x: selectionRectLeft.value + selectionRectWidth.value,
      y: selectionRectTop.value + selectionRectHeight.value,
    },
  };

  eventBus.emit("EV_AREA_SELECTION_DONE", coordinates);
}

function selectRectNotation(): void {
  if (getSelectedRect()!.notationType === "IMAGE") {
    setSelectionPositionForImage();
  }

  if (getSelectedRect()!.notationType === "TEXT") {
    setSelectionPositionForText(getSelectedRect() as RectNotationAttributes);
  }
}

function selectAnnotation(): void {
  setSelectionPositionForAnnotation(
    getSelectedAnnotation() as AnnotationNotationAttributes,
  );
}

function setSelectionPositionForAnnotation(
  selectedNotation: AnnotationNotationAttributes,
) {
  selectionPosition.value.x1 =
    cellStore.getSvgBoundingRect().left + selectedNotation.x - 1;
  selectionPosition.value.x2 =
    selectionPosition.value.x1 + selectedNotation.value.length * 5 + 3;
  selectionPosition.value.y1 =
    cellStore.getSvgBoundingRect().top + selectedNotation.y;
  selectionPosition.value.y2 = selectionPosition.value.y1 + 15;

  selectionRotation.value = (selectedNotation as any).rotation || 0;
}

function setSelectionPositionForText(selectedNotation: RectNotationAttributes) {
  selectionPosition.value.x1 =
    cellStore.getSvgBoundingRect().left +
    selectedNotation.fromCol * cellStore.getCellHorizontalWidth();
  selectionPosition.value.x2 =
    cellStore.getSvgBoundingRect().left +
    (selectedNotation.toCol + 1) * cellStore.getCellHorizontalWidth();
  selectionPosition.value.y1 =
    cellStore.getSvgBoundingRect().top +
    selectedNotation.fromRow * cellStore.getCellVerticalHeight();
  selectionPosition.value.y2 =
    cellStore.getSvgBoundingRect().top +
    (selectedNotation.toRow + 1) * cellStore.getCellVerticalHeight();
}

function setSelectionPositionForImage() {
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
  touch-action: none; /* prevent scrolling on touch devices */
}
</style>
