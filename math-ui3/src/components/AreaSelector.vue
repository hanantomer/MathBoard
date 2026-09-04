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
import { computed, ref, watch } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { NotationType, SelectionMoveDirection } from "common/unions";
import {
  RectCoordinates,
  DotCoordinates,
  RectNotationAttributes,
  ImageNotationAttributes,
  isRect,
  AnnotationNotationAttributes,
  NotationAttributes,
  LineNotationAttributes,
  PointNotationAttributes,
} from "common/baseTypes";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useSelectionHelper from "../helpers/selectionHelper";
import useEventBusHelper from "../helpers/eventBusHelper";
import useWatchHelper from "../helpers/watchHelper";
import UseAuthorizationHelper from "../helpers/authorizationHelper";
import useScreenHelper from "../helpers/screenHelper";
import useNotationCellOccupationHelper from "../helpers/notationCellOccupationHelper";
import { MOBILE_BOARD_MEDIA_QUERY } from "../composables/useBoardLayout";

const screenHelper = useScreenHelper();
const cellOccupationHelper = useNotationCellOccupationHelper();
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

const isMobileBoard = useMediaQuery(MOBILE_BOARD_MEDIA_QUERY);

let lineTypes: Array<NotationType> = [
  "CURVE",
  "CIRCLE",
  "CONIC",
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

const show = computed(() => {
  return (
    (editModeStore.isAnnotationSelectedMode() ||
      editModeStore.isImageSelectedMode() ||
      editModeStore.isTextSelectedMode() ||
      editModeStore.isTextSelectionMode() ||
      editModeStore.isAreaSelectionOrMovingMode()) &&
    !editModeStore.isImageCroppingMode() &&
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
watchHelper.watchPointerEvent(
  ["AREA_SELECTION_STARTED", "TEXT_STARTED"],
  ["EV_SVG_POINTERDOWN", "EV_SVG_POINTERCANCEL"],
  startAreaSelection,
);

// Desktop: drag from a selected cell starts a marquee. On mobile that steals taps.
watchHelper.watchPointerEvent(
  ["CELL_SELECTED"],
  ["EV_SVG_POINTERMOVE"],
  (e: PointerEvent) => {
    if (isMobileBoard.value) return;
    startAreaSelection(e);
  },
);



watchHelper.watchPointerEvent(
  ["AREA_SELECTION_STARTED", "TEXT_AREA_SELECTING"],
  ["EV_SVG_POINTERMOVE"],
  updateSelectionArea,
);

watchHelper.watchPointerEvent(
  ["TEXT_SELECTED"],
  ["EV_TEXT_SELECTED"],
  selectRectNotation,
);

watchHelper.watchPointerEvent(
  ["IMAGE_SELECTED"],
  ["EV_IMAGE_SELECTED"],
  selectRectNotation,
);

watchHelper.watchPointerEvent(
  ["AREA_SELECTION_STARTED", "TEXT_AREA_SELECTING", "RESIZING"],
  ["EV_SVG_POINTERUP"],
  endSelect,
);

watchHelper.watchPointerEvent(
  ["AREA_SELECTED", "RESIZE_STARTED", "RESIZING"],
  ["EV_SVG_POINTERDOWN"],
  cancelSelectionWhenUserClickedOutside,
);

watchHelper.watchKeyEvent(["AREA_SELECTED"], "EV_KEYUP", handleKeyUp);

watchHelper.watchPointerEvent(
  ["AREA_SELECTED", "IMAGE_SELECTED", "TEXT_SELECTED", "ANNOTATION_SELECTED"],
  ["EV_SVG_POINTERMOVE"],
  startMmoveSelectedNotations,
);

watchHelper.watchPointerEvent(
  ["AREA_MOVING"],
  ["EV_SVG_POINTERMOVE"],
  moveSelectedNotations,
);

watchHelper.watchPointerEvent(
  ["AREA_MOVING"],
  ["EV_SVG_POINTERUP"],
  endMoveSelection,
);

watchHelper.watchPointerEvent(
  ["AREA_MOVING"],
  ["EV_SVG_POINTERUP"],
  endMoveSelection,
);

watchHelper.watchPointerEvent(
  ["AREA_MOVING"],
  ["EV_POINTERUP"],
  endMoveSelection,
);

watchHelper.watchPointerEvent(
  ["TEXT_STARTED", "IMAGE_SELECTED"],
  ["EV_SVG_POINTERUP"],
  cancelTextSelectionWhenUserClickedOutside /*takes action when clicked outside of selection area*/,
);

watchHelper.watchNotationSelection(
  ["ANNOTATION_SELECTED"],
  "EV_ANNOTATION_SELECTED",
  selectAnnotation,
);

function startMmoveSelectedNotations(e: PointerEvent) {
  if (!authorizationHelper.canEdit()) return;
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

function cancelTextSelectionWhenUserClickedOutside(e: PointerEvent) {
  e.stopPropagation();
  notationStore.resetSelectedNotations();
  resetSelectionPosition();
  editModeStore.setDefaultEditMode();
}

function isTextGlobalMode(): boolean {
  return editModeStore.getGlobalEditMode() === "TEXT";
}

function startAreaSelection(e: PointerEvent) {
  if (!authorizationHelper.canEdit()) return;
  if (!isTextGlobalMode()) return;

  horizontalDirection = "NONE";
  verticalDirection = "NONE";

  notationStore.resetSelectedNotations();

  resetSelectionPosition();

  setStartPosition(e);

  if (editModeStore.getEditMode() === "TEXT_STARTED") {
    editModeStore.setEditMode("TEXT_AREA_SELECTING");
  } else {
    editModeStore.setEditMode("AREA_SELECTION_STARTED");
  }
}

function setStartPosition(e: PointerEvent) {
  selectionPosition.value.x2 = selectionPosition.value.x1 = e.clientX;
  selectionPosition.value.y2 = selectionPosition.value.y1 = e.clientY;
}

async function handleKeyUp(e: KeyboardEvent) {
  if (!authorizationHelper.canEdit()) return;
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
function updateSelectionArea(e: PointerEvent) {
  if (!authorizationHelper.canEdit()) return;
  if (!isTextGlobalMode()) return;
  setSelectionDirection(e);

  if (horizontalDirection === "NONE" || verticalDirection === "NONE") {
    return;
  }

  if (horizontalDirection === "LEFT") {
    selectionPosition.value.x1 = e.clientX;
  }

  if (horizontalDirection === "RIGHT") {
    selectionPosition.value.x2 = e.clientX;
  }

  if (verticalDirection === "UP") {
    selectionPosition.value.y1 = e.clientY;
  }

  if (verticalDirection === "BOTTOM") {
    selectionPosition.value.y2 = e.clientY;
  }
}

function setSelectionDirection(e: PointerEvent) {
  if (horizontalDirection === "NONE") {
    if (e.clientX > selectionPosition.value.x1) {
      horizontalDirection = "RIGHT";
    } else if (e.clientX < selectionPosition.value.x1) {
      horizontalDirection = "LEFT";
    }
  }

  if (verticalDirection === "NONE") {
    if (e.clientY > selectionPosition.value.y1) {
      verticalDirection = "BOTTOM";
    } else if (e.clientY < selectionPosition.value.y1) {
      verticalDirection = "UP";
    }
  }
}

function endSelect(e: PointerEvent) {
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
    if (!isTextGlobalMode()) {
      resetSelectionPosition();
      editModeStore.setDefaultEditMode();
      return;
    }
    const top = selectionRectTop.value - cellStore.getSvgBoundingRect().top;

    const bottom = top + selectionRectHeight.value;

    const left = selectionRectLeft.value - cellStore.getSvgBoundingRect().left;

    const right = left + selectionRectWidth.value;

    selectionHelper.selectNotationsOfArea({
      topLeft: {
        x: left,
        y: top,
      },
      bottomRight: {
        x: right,
        y: bottom,
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
  syncSelectionOverlayPosition();
}

function shouldSyncSelectionOverlay(): boolean {
  const mode = editModeStore.getEditMode();
  if (mode === "IMAGE_CROPPING") {
    return false;
  }
  if (mode === "AREA_SELECTION_STARTED" || mode === "TEXT_AREA_SELECTING") {
    return false;
  }
  return (
    editModeStore.isAnnotationSelectedMode() ||
    editModeStore.isImageSelectedMode() ||
    editModeStore.isTextSelectedMode() ||
    editModeStore.isAreaSelectionOrMovingMode() ||
    editModeStore.isTextSelectionMode()
  );
}

function applyViewportBounds(
  left: number,
  top: number,
  right: number,
  bottom: number,
) {
  selectionPosition.value.x1 = left;
  selectionPosition.value.y1 = top;
  selectionPosition.value.x2 = right;
  selectionPosition.value.y2 = bottom;
}

function extendBoundsFromNotation(
  notation: NotationAttributes,
  bounds: { x1: number; y1: number; x2: number; y2: number },
) {
  const svg = cellStore.getSvgBoundingRect();
  const el = document.getElementById(notation.uuid);
  if (el) {
    const r = el.getBoundingClientRect();
    bounds.x1 = Math.min(bounds.x1, r.left);
    bounds.y1 = Math.min(bounds.y1, r.top);
    bounds.x2 = Math.max(bounds.x2, r.right);
    bounds.y2 = Math.max(bounds.y2, r.bottom);
    return;
  }

  switch (notation.notationType) {
    case "LINE":
    case "DIVISIONLINE": {
      const line = notation as LineNotationAttributes;
      bounds.x1 = Math.min(bounds.x1, svg.left + Math.min(line.p1x, line.p2x));
      bounds.y1 = Math.min(bounds.y1, svg.top + Math.min(line.p1y, line.p2y));
      bounds.x2 = Math.max(bounds.x2, svg.left + Math.max(line.p1x, line.p2x));
      bounds.y2 = Math.max(bounds.y2, svg.top + Math.max(line.p1y, line.p2y));
      break;
    }
    case "TEXT": {
      const rect = notation as RectNotationAttributes;
      bounds.x1 = Math.min(
        bounds.x1,
        svg.left + rect.fromCol * cellStore.getCellHorizontalWidth(),
      );
      bounds.y1 = Math.min(
        bounds.y1,
        svg.top + rect.fromRow * cellStore.getCellVerticalHeight(),
      );
      bounds.x2 = Math.max(
        bounds.x2,
        svg.left + (rect.toCol + 1) * cellStore.getCellHorizontalWidth(),
      );
      bounds.y2 = Math.max(
        bounds.y2,
        svg.top + (rect.toRow + 1) * cellStore.getCellVerticalHeight(),
      );
      break;
    }
    case "IMAGE": {
      const image = notation as ImageNotationAttributes;
      const pixelBounds =
        cellOccupationHelper.getImageRotatedPixelBounds(image);
      bounds.x1 = Math.min(bounds.x1, svg.left + pixelBounds.x);
      bounds.y1 = Math.min(bounds.y1, svg.top + pixelBounds.y);
      bounds.x2 = Math.max(
        bounds.x2,
        svg.left + pixelBounds.x + pixelBounds.width,
      );
      bounds.y2 = Math.max(
        bounds.y2,
        svg.top + pixelBounds.y + pixelBounds.height,
      );
      break;
    }
    case "ANNOTATION": {
      const ann = notation as AnnotationNotationAttributes;
      const pixelBounds = cellOccupationHelper.getAnnotationPixelBounds(ann);
      bounds.x1 = Math.min(bounds.x1, svg.left + pixelBounds.x);
      bounds.y1 = Math.min(bounds.y1, svg.top + pixelBounds.y);
      bounds.x2 = Math.max(
        bounds.x2,
        svg.left + pixelBounds.x + pixelBounds.width,
      );
      bounds.y2 = Math.max(
        bounds.y2,
        svg.top + pixelBounds.y + pixelBounds.height,
      );
      break;
    }
    default: {
      const cell = notation as PointNotationAttributes;
      if (cell.col == null || cell.row == null) break;
      const cellLeft =
        svg.left + cell.col * cellStore.getCellHorizontalWidth();
      const cellTop = svg.top + cell.row * cellStore.getCellVerticalHeight();
      bounds.x1 = Math.min(bounds.x1, cellLeft);
      bounds.y1 = Math.min(bounds.y1, cellTop);
      bounds.x2 = Math.max(
        bounds.x2,
        cellLeft + cellStore.getCellHorizontalWidth(),
      );
      bounds.y2 = Math.max(
        bounds.y2,
        cellTop + cellStore.getCellVerticalHeight(),
      );
    }
  }
}

function setSelectionPositionFromNotations(notations: NotationAttributes[]) {
  const bounds = {
    x1: Number.POSITIVE_INFINITY,
    y1: Number.POSITIVE_INFINITY,
    x2: Number.NEGATIVE_INFINITY,
    y2: Number.NEGATIVE_INFINITY,
  };

  for (const notation of notations) {
    extendBoundsFromNotation(notation, bounds);
  }

  if (!Number.isFinite(bounds.x1)) return;

  applyViewportBounds(bounds.x1, bounds.y1, bounds.x2, bounds.y2);
  selectionRotation.value = 0;
}

function syncSelectionOverlayPosition() {
  if (!shouldSyncSelectionOverlay()) return;

  const selected = notationStore.getSelectedNotations();
  if (selected.length === 0) return;

  if (editModeStore.isImageSelectedMode() && getSelectedRect()) {
    setSelectionPositionForImage();
    return;
  }

  if (editModeStore.isTextSelectedMode() && getSelectedRect()) {
    setSelectionPositionForText(getSelectedRect() as RectNotationAttributes);
    selectionRotation.value = 0;
    return;
  }

  if (editModeStore.isAnnotationSelectedMode()) {
    setSelectionPositionForAnnotation(
      getSelectedAnnotation() as AnnotationNotationAttributes,
    );
    return;
  }

  if (
    editModeStore.isAreaSelectedMode() ||
    editModeStore.getEditMode() === "AREA_MOVING"
  ) {
    setSelectionPositionFromNotations(selected);
  }
}

watch(
  () => {
    const r = cellStore.getSvgBoundingRect();
    return [r.top, r.left, r.width, r.height].join(",");
  },
  () => {
    syncSelectionOverlayPosition();
  },
);

function onSelectionMouseDrag(e: PointerEvent) {
  eventBus.emit("EV_SVG_POINTERMOVE", e);
}

async function onSelectionMouseUp(e: PointerEvent) {
  eventBus.emit("EV_SVG_POINTERUP", e);
}

function moveSelectedNotations(e: PointerEvent) {
  if (!authorizationHelper.canEdit()) return;
  if (!e.buttons) return;
  // initial drag position
  if (!dragPosition.value.x) {
    dragPosition.value.x = e.clientX;
    dragPosition.value.y = e.clientY;
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

function moveAtCellScale(e: PointerEvent) {
  const deltaCol = Math.round(
    (e.clientX - dragPosition.value.x) / cellStore.getCellHorizontalWidth(),
  );

  const deltaRow = Math.round(
    (e.clientY - dragPosition.value.y) / cellStore.getCellVerticalHeight(),
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

function moveAtPixelScale(e: PointerEvent) {
  const deltaX = e.clientX - dragPosition.value.x;
  const deltaY = e.clientY - dragPosition.value.y;

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

async function endMoveSelection(e: PointerEvent) {
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
  const el = document.getElementById(selectedNotation.uuid);
  if (el) {
    const r = el.getBoundingClientRect();
    applyViewportBounds(r.left, r.top, r.right, r.bottom);
    selectionRotation.value = 0;
    return;
  }

  const svg = cellStore.getSvgBoundingRect();
  const bounds = cellOccupationHelper.getAnnotationPixelBounds(selectedNotation);
  applyViewportBounds(
    svg.left + bounds.x,
    svg.top + bounds.y,
    svg.left + bounds.x + bounds.width,
    svg.top + bounds.y + bounds.height,
  );
  selectionRotation.value = selectedNotation.rotation || 0;
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
  const imageNotation = getSelectedRect() as ImageNotationAttributes;
  const svg = cellStore.getSvgBoundingRect();
  const colW = cellStore.getCellHorizontalWidth();
  const rowH = cellStore.getCellVerticalHeight();

  selectionPosition.value.x1 = svg.left + imageNotation.fromCol * colW;
  selectionPosition.value.x2 =
    svg.left + (imageNotation.toCol + 1) * colW;
  selectionPosition.value.y1 = svg.top + imageNotation.fromRow * rowH;
  selectionPosition.value.y2 =
    svg.top + (imageNotation.toRow + 1) * rowH;
  selectionRotation.value = imageNotation.rotation ?? 0;
}

watch(
  () => {
    if (!editModeStore.isImageSelectedMode()) return "";
    const selected = notationStore.getSelectedNotations();
    if (selected.length !== 1 || selected[0].notationType !== "IMAGE") {
      return "";
    }
    const image = selected[0] as ImageNotationAttributes;
    return `${image.uuid}:${image.rotation ?? 0}`;
  },
  () => {
    if (editModeStore.isImageSelectedMode() && getSelectedRect()) {
      setSelectionPositionForImage();
    }
  },
);
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
  position: fixed;
  z-index: 99;
  touch-action: none;
}
</style>
