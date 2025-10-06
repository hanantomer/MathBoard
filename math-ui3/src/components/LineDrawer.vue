<template>
  <div v-show="show">
    <lineWatcher
      :startEntry="{
        editMode: ['LINE_STARTED'],
        func: setInitialPosition,
      }"
      :drawEntry="{
        editMode: ['LINE_DRAWING'],
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
      :saveEntry="{
        editMode: ['LINE_DRAWING', 'LINE_EDITING_RIGHT', 'LINE_EDITING_LEFT'],
        func: endDrawing,
      }"
      :selectEntry="{
        editMode: ['LINE_SELECTED'],
        func: selectLine,
        event: 'EV_LINE_SELECTED',
      }"
      :moveByKeyEntry="{
        editMode: ['LINE_SELECTED'],
        func: moveLine,
      }"
      :endEntry="{
        editMode: ['LINE_SELECTED'],
      }"
    />
    <line-handle
      v-show="editModeStore.isLineMode()"
      drawing-mode="LINE_DRAWING"
      editing-mode="LINE_EDITING_LEFT"
      v-bind:style="{
        left: handleLeft + 'px',
        top: handleTop + 'px',
      }"
    ></line-handle>
    <line-handle
      v-show="editModeStore.isLineMode()"
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
        :class="{ dashed: linePosition.dashed }"
        :marker-start="linePosition.arrowLeft ? 'url(#arrowleft)' : ''"
        :marker-end="linePosition.arrowRight ? 'url(#arrowright)' : ''"
        vector-effect="non-scaling-stroke"
        stroke-linecap="square"
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
import { line } from "d3";

const eventBus = useEventBus();
const editModeStore = useEditModeStore();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const screenHelper = useScreenHelper();
const notationMutateHelper = useNotationMutateHelper();

// vars

let movementDirection: MovementDirection = "NONE";

let slopeType: SlopeType = "NONE";

const linePosition = ref<LineAttributes>({
  p1x: 0,
  p2x: 0,
  p1y: 0,
  p2y: 0,
  dashed: false,
  arrowLeft: false,
  arrowRight: false,
});

const modifyRight = computed(
  () =>
    (slopeType === "POSITIVE" && movementDirection === "UP") ||
    (slopeType === "NEGATIVE" && movementDirection === "DOWN"),
);

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

  if (modifyRight.value) {
    linePosition.value.p2x = p.x;
    linePosition.value.p2y = p.y;
  } else {
    linePosition.value.p1x = p.x;
    linePosition.value.p1y = p.y;
  }
}

function selectLine(notation: NotationAttributes) {
  const n = notation as LineNotationAttributes;

  slopeType = getSlopeTypeForExistingLine(n);

  linePosition.value.p1x = n.p1x;
  linePosition.value.p2x = n.p2x;
  linePosition.value.p1y = n.p1y;
  linePosition.value.p2y = n.p2y;
  linePosition.value.dashed = n.dashed;
  linePosition.value.arrowLeft = n.arrowLeft;
  linePosition.value.arrowRight = n.arrowRight;
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

function editNotStarted(): boolean {
  return (
    Math.abs(linePosition.value.p1x - linePosition.value.p2x) < 5 &&
    Math.abs(linePosition.value.p1y - linePosition.value.p2y) < 5
  );
}

async function endDrawing(): Promise<string> {
  if (editNotStarted()) {
    editModeStore.setDefaultEditMode();
    return "";
  }

  return await saveLine();
}

async function saveLine(fixEdge: boolean = true): Promise<string> {
  if (fixEdge) {
    linePosition.value.p1x = getAdjustedEdge({
      x: linePosition.value.p1x,
      y: linePosition.value.p1y,
    }).x;

    linePosition.value.p1y = getAdjustedEdge({
      x: linePosition.value.p1x,
      y: linePosition.value.p1y,
    }).y;

    linePosition.value.p2x = getAdjustedEdge({
      x: linePosition.value.p2x,
      y: linePosition.value.p2y,
    }).x;

    linePosition.value.p2y = getAdjustedEdge({
      x: linePosition.value.p2x,
      y: linePosition.value.p2y,
    }).y;
  }

  if (notationStore.getSelectedNotations().length > 0) {
    let updatedLine = {
      ...notationStore.getSelectedNotations().at(0)!,
      ...linePosition.value,
    };

    notationMutateHelper.updateLineNotation(
      updatedLine as LineNotationAttributes,
    );
    return updatedLine.uuid;
  } else {
    return notationMutateHelper.addLineNotation(linePosition.value);
  }
}

function getAdjustedEdge(point: DotCoordinates): DotCoordinates {
  // line edge at point
  const nearLineAtPoint = screenHelper.getNearestLineEdge(point);

  if (nearLineAtPoint != null) {
    return { x: nearLineAtPoint.x, y: nearLineAtPoint.y };
  }

  // circle edge at left
  const nearCircleAtLeft = screenHelper.getNearestCircleEdge(point);

  if (nearCircleAtLeft != null) {
    return { x: nearCircleAtLeft.x, y: nearCircleAtLeft.y };
  }

  // intersection with other line
  const nearestIntersection = screenHelper.getNearestNotationPoint(point);

  if (nearestIntersection != null) {
    return { x: nearestIntersection.x, y: nearestIntersection.y };
  }

  // cell X edge
  const nearCellXBorder = screenHelper.getNearestCellXBorder(point);

  if (nearCellXBorder != null) {
    return { x: nearCellXBorder, y: point.y };
  }

  // cell Y edge at right
  const nearCellYBorder = screenHelper.getNearestCellYBorder(point);

  if (nearCellYBorder != null) {
    return { x: point.x, y: nearCellYBorder };
  }

  return point;
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

<style scoped>
.line {
  stroke: black;
  stroke-width: 2px;
}

.dashed {
  stroke-dasharray: 5, 5;
}

/* Ensure markers scale properly with the line */
:deep(marker) {
  overflow: visible;
  stroke-width: inherit;
}
</style>
