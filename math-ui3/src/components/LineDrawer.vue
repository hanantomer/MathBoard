<template>
  <div v-show="show">
    <lineWatcher
      :startEntry="{
        editMode: ['LINE_STARTED', 'POLYGON_STARTED'],
        func: setInitialPosition,
      }"
      :drawEntry="{
        editMode: ['LINE_DRAWING', 'POLYGON_DRAWING'],
        func: drawLine,
      }"
      :editEntryFirstHandle="{
        editMode: ['LINE_EDITING_LEFT'],
        func: modifyLineLeft,
      }"
      :editEntrySecondHandle="{
        editMode: ['LINE_EDITING_RIGHT'],
        func: modifyLineRight,
      }"
      :endEntry="{
        editMode: [
          'LINE_DRAWING',
          'LINE_EDITING_RIGHT',
          'LINE_EDITING_LEFT',
          'LINE_SELECTED',
          'POLYGON_DRAWING',
        ],
        func: endDrawing,
      }"
      :selectEntry="{
        editMode: ['LINE_SELECTED'],
        func: selectLine,
        event: 'EV_LINE_SELECTED', ///TODO handle polygon
      }"
      :moveByKeyEntry="{
        editMode: ['LINE_SELECTED'],
        func: moveLine,
      }"
      :endSelectionEntry="{
        editMode: ['LINE_SELECTED'],
      }"
    />

    <line-handle
      drawing-mode="LINE_DRAWING"
      editing-mode="LINE_EDITING_LEFT"
      v-bind:style="{
        left: handleLeft + 'px',
        top: handleTop + 'px',
      }"
    ></line-handle>
    <line-handle
      drawing-mode="LINE_DRAWING"
      editing-mode="LINE_EDITING_RIGHT"
      v-bind:style="{
        left: handleRight + 'px',
        top: handleBottom + 'px',
      }"
    ></line-handle>

    <svg
      height="800"
      width="1500"
      xmlns="http://www.w3.org/2000/svg"
      class="line-svg"
    >
      <line
        :x1="linePosition.p1x"
        :y1="linePosition.p1y"
        :x2="linePosition.p2x"
        :y2="linePosition.p2y"
        class="line"
      />
    </svg>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useNotationStore } from "../store/pinia/notationStore";
import {
  SlopeType,
  LineAttributes,
  MovementDirection,
  DotCoordinates,
  LineNotationAttributes,
  NotationAttributes,
} from "../../../math-common/src/baseTypes";
import useEventBus from "../helpers/eventBusHelper";
import lineWatcher from "./LineWatcher.vue";
import lineHandle from "./LineHandle.vue";
import useScreenHelper from "../helpers/screenHelper"; // Add this line
import useNotationMutateHelper from "../helpers/notationMutateHelper"; // Add this line

const eventBus = useEventBus();
const editModeStore = useEditModeStore();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const screenHelper = useScreenHelper();
const notationMutateHelper = useNotationMutateHelper();

// vars

const POLYGON_SAVE_DELAY = 1000;

let drawingTimer: number | null = null;

let modifyRight = false;

let movementDirection: MovementDirection = "NONE";

let slopeType: SlopeType = "NONE";

const linePosition = ref<LineAttributes>({
  p1x: 0,
  p2x: 0,
  p1y: 0,
  p2y: 0,
});

// watch
// Watch for any change in linePosition's properties
watch(
  linePosition,
  (newVal) => {
    const height = Math.round(
      Math.abs(newVal.p2y - newVal.p1y) / cellStore.getCellHorizontalWidth(),
    );
    const width = Math.round(
      Math.abs(newVal.p2x - newVal.p1x) / cellStore.getCellHorizontalWidth(),
    );
    const LineStatus = `Line width: ${width}, Line height: ${height}`;
    eventBus.emit("EV_LINE_CHANGED", LineStatus);
  },
  { deep: true },
);
// computed

const show = computed(() => {
  return (
    editModeStore.isLineDrawingMode() ||
    editModeStore.isLineSelectedMode() ||
    editModeStore.isLineEditingMode()
  );
});

let handleLeft = computed(() => {
  return linePosition.value.p1x + (cellStore.getSvgBoundingRect().left ?? 0);
});

let handleRight = computed(() => {
  return linePosition.value.p2x + (cellStore.getSvgBoundingRect().left ?? 0);
});

let handleTop = computed(() => {
  return linePosition.value.p1y + (cellStore.getSvgBoundingRect().top ?? 0);
});

let handleBottom = computed(() => {
  return linePosition.value.p2y + (cellStore.getSvgBoundingRect().top ?? 0);
});

function setInitialPosition(p: DotCoordinates) {
  linePosition.value.p1x = p.x;
  linePosition.value.p2x = p.x;
  linePosition.value.p1y = p.y;
  linePosition.value.p2y = p.y;
  slopeType = "NONE";
  movementDirection = "NONE";
}

function drawLine(p: DotCoordinates) {
  if (editModeStore.isPolygonDrawingMode()) {
    handlePolygonTimer(p);
  }

  if (slopeType === "NONE") {
    slopeType = getSlopeTypeForNewLine(p.x, p.y);
  }

  if (movementDirection === "NONE") {
    movementDirection = getMovementDirection(p.y);
  }

  // 4 options for drawing sloped line:
  // 1. upper left to lower right. direction is DOWN and slopeType is NEGATIVE
  // 2  lower right to upper left. direction is UP and slopeType is NEGATIVE
  // 3. upper right to lower left. direction is DOWN and slopeType is POSITIVE
  // 4. lower left to upper right. direction is UP and slopeType is POSITIVE

  modifyRight =
    (slopeType === "POSITIVE" && movementDirection === "UP") ||
    (slopeType === "NEGATIVE" && movementDirection === "DOWN");

  if (modifyRight) {
    linePosition.value.p2x = p.x;
    linePosition.value.p2y = p.y;
  } else {
    linePosition.value.p1x = p.x;
    linePosition.value.p1y = p.y;
  }
}

function handlePolygonTimer(p: DotCoordinates) {
  // Clear any existing timer
  if (drawingTimer) {
    clearTimeout(drawingTimer);
  }

  // Start new timer
  drawingTimer = window.setTimeout(() => {
    saveLine();
    setInitialPosition(p);
    editModeStore.setNextEditMode();
    drawingTimer = null;
  }, POLYGON_SAVE_DELAY);
}

function selectLine(notation: NotationAttributes) {
  const n = notation as LineNotationAttributes;

  slopeType = getSlopeTypeForExistingLine(n);

  linePosition.value.p1x = n.p1x;
  linePosition.value.p2x = n.p2x;
  linePosition.value.p1y = n.p1y;
  linePosition.value.p2y = n.p2y;
}

function modifyLineLeft(p: DotCoordinates) {
  movementDirection = getMovementDirection(p.x);

  linePosition.value.p1x = p.x;
  linePosition.value.p1y = p.y;
}

function modifyLineRight(p: DotCoordinates) {
  movementDirection = getMovementDirection(p.y);

  linePosition.value.p2x = p.x;
  linePosition.value.p2y = p.y;
}

function getSlopeTypeForNewLine(xPos: number, yPos: number): SlopeType {
  if (
    /*moving up and right*/
    (yPos < linePosition.value.p2y && xPos > linePosition.value.p2x) ||
    /*moving down and left*/
    (yPos > linePosition.value.p2y && xPos < linePosition.value.p2x)
  ) {
    return "POSITIVE";
  }

  return "NEGATIVE";
}

function getSlopeTypeForExistingLine(line: LineAttributes): SlopeType {
  return line.p2y < line.p1y ? "POSITIVE" : "NEGATIVE";
}

function getMovementDirection(yPos: number): MovementDirection {
  return (slopeType === "POSITIVE" && yPos > linePosition.value.p2y) ||
    (slopeType === "NEGATIVE" && yPos > linePosition.value.p1y)
    ? "DOWN"
    : "UP";
}

function endDrawing() {
  if (editModeStore.isPolygonDrawingMode() && drawingTimer) {
    clearTimeout(drawingTimer);
    drawingTimer = null;
  }

  if (editModeStore.isLineDrawingMode() || editModeStore.isLineEditingMode()) {
    saveLine();
  }

  editModeStore.setDefaultEditMode();
}

function saveLine(fixEdge: boolean = true) {
  if (
    linePosition.value.p1x === 0 &&
    linePosition.value.p1y === 0 &&
    linePosition.value.p2x === 0 &&
    linePosition.value.p2y === 0
  ) {
    return;
  }

  if (
    linePosition.value.p1x == linePosition.value.p2x &&
    linePosition.value.p2y == linePosition.value.p2y
  ) {
    return;
  }

  if (fixEdge) {
    fixLineLeftEdge(linePosition.value);
    fixLineRightEdge(linePosition.value);
  }

  if (notationStore.getSelectedNotations().length > 0) {
    let updatedLine = {
      ...notationStore.getSelectedNotations().at(0)!,
      ...linePosition.value,
    };

    notationMutateHelper.updateLineNotation(
      updatedLine as LineNotationAttributes,
    );
  } else {
    notationMutateHelper.addLineNotation(linePosition.value);
  }
}

function fixLineRightEdge(linePosition: LineAttributes) {
  const lineRightPosition = {
    x: linePosition.p2x,
    y: linePosition.p2y,
  };

  // notation edge at right
  const nearNoatationAtRight =
    screenHelper.getNearestNotationEdge(lineRightPosition);

  if (nearNoatationAtRight != null) {
    linePosition.p2x = nearNoatationAtRight.x;
    linePosition.p2y = nearNoatationAtRight.y;
  }

  if (nearNoatationAtRight == null) {
    // cell X edge at right
    const nearCellXBorderAtRight =
      screenHelper.getNearestCellXBorder(lineRightPosition);

    if (nearCellXBorderAtRight != null) {
      linePosition.p2x = nearCellXBorderAtRight;
    }

    // cell Y edge at right
    const nearCellYBorderAtRight =
      screenHelper.getNearestCellYBorder(lineRightPosition);

    if (nearCellYBorderAtRight != null) {
      linePosition.p2y = nearCellYBorderAtRight;
    }
  }
}

function fixLineLeftEdge(linePosition: LineAttributes) {
  const lineLeftPosition = {
    x: linePosition.p1x,
    y: linePosition.p1y,
  };

  // notation edge at left
  const nearNoatationAtLeft =
    screenHelper.getNearestNotationEdge(lineLeftPosition);

  if (nearNoatationAtLeft != null) {
    linePosition.p1x = nearNoatationAtLeft.x;
    linePosition.p1y = nearNoatationAtLeft.y;
  }

  if (nearNoatationAtLeft == null) {
    // cell X edge at left
    const nearCellXBorderAtLeft =
      screenHelper.getNearestCellXBorder(lineLeftPosition);

    if (nearCellXBorderAtLeft != null) {
      linePosition.p1x = nearCellXBorderAtLeft;
    }

    // cell Y edge at right
    const nearCellYBorderAtLeft =
      screenHelper.getNearestCellYBorder(lineLeftPosition);

    if (nearCellYBorderAtLeft != null) {
      linePosition.p1y = nearCellYBorderAtLeft;
    }
  }
}

function applyMoveToLine(dx: number, dy: number) {
  linePosition.value.p1y += dy;
  linePosition.value.p2y += dy;
  linePosition.value.p1x += dx;
  linePosition.value.p2x += dx;
}

function moveLine(moveX: number, moveY: number) {
  applyMoveToLine(moveX, moveY);
  saveLine();
}

function moveLineByKey(moveX: number, moveY: number) {
  applyMoveToLine(moveX, moveY);
  saveLine(false);
}
</script>
