<template>
  <div v-show="show">
    <lineWatcher
      :startEntry="{
        editMode: ['DIVISIONLINE_STARTED'],
        func: setInitialPosition,
      }"
      :drawEntry="{
        editMode: ['DIVISIONLINE_DRAWING'],
        func: drawLine,
      }"
      :editEntryFirstHandle="{
        editMode: ['DIVISIONLINE_EDITING_LEFT'],
        func: modifyLineLeft,
      }"
      :editEntrySecondHandle="{
        editMode: ['DIVISIONLINE_EDITING_RIGHT'],
        func: modifyLineRight,
      }"
      :saveEntry="{
        editMode: [
          'DIVISIONLINE_DRAWING',
          'DIVISIONLINE_EDITING_RIGHT',
          'DIVISIONLINE_EDITING_LEFT',
        ],
        func: saveLine,
      }"
      :selectEntry="{
        editMode: ['DIVISIONLINE_SELECTED'],
        func: selectLine,
        event: 'EV_DIVISIONLINE_SELECTED',
      }"
      :moveByKeyEntry="{
        editMode: ['DIVISIONLINE_SELECTED'],
        func: moveLine,
      }"
      :endEntry="{
        editMode: ['DIVISIONLINE_SELECTED'],
      }"
    />
    <line-handle
      data-cy="divisionLineLeftHandle"
      v-show="editModeStore.isDivisionLineMode()"
      drawing-mode="DIVISIONLINE_DRAWING"
      editing-mode="DIVISIONLINE_EDITING_LEFT"
      v-bind:style="{
        left: handleLeft + 'px',
        top: handleTop + 'px',
      }"
    ></line-handle>
    <line-handle
      data-cy="divisionLineRightHandle"
      v-show="editModeStore.isDivisionLineMode()"
      drawing-mode="DIVISIONLINE_DRAWING"
      editing-mode="DIVISIONLINE_EDITING_RIGHT"
      v-bind:style="{
        left: handleRight + 'px',
        top: handleBottom + 'px',
      }"
    ></line-handle>

    <svg
      :style="{
        width: matrixSize.width,
        height: matrixSize.height,
      }"
      xmlns="http://www.w3.org/2000/svg"
      class="line-svg"
    >
      <line
        :x1="lineAttributes.p1x"
        :y1="lineAttributes.p1y"
        :x2="lineAttributes.p2x"
        :y2="lineAttributes.p1y"
        class="line"
        data-cy="division"
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
  LineAttributes,
  DotCoordinates,
  LineNotationAttributes,
  NotationAttributes,
} from "common/baseTypes";
import useEventBus from "../helpers/eventBusHelper";
import lineWatcher from "./LineWatcher.vue";
import lineHandle from "./LineHandle.vue";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import { matrixSize } from "common/globals";

const eventBus = useEventBus();
const editModeStore = useEditModeStore();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const notationMutateHelper = useNotationMutateHelper();

// vars

const lineAttributes = ref<LineAttributes>({
  p1x: 0,
  p2x: 0,
  p1y: 0,
  p2y: 0,
  dashed: false,
  arrowLeft: false,
  arrowRight: false,
});

// Modify the drawLine function to ensure horizontal lines
function drawLine(p: DotCoordinates) {
  // Ensure x positions snap to cell width increments
  const snapToCell = (x: number) =>
    Math.round(x / cellStore.getCellHorizontalWidth()) *
    cellStore.getCellHorizontalWidth();

  if (modifyRight.value) {
    // Ensure minimum width of one cell
    const minX = lineAttributes.value.p1x + cellStore.getCellHorizontalWidth();
    lineAttributes.value.p2x = Math.max(minX, snapToCell(p.x));
    lineAttributes.value.p2y = lineAttributes.value.p1y; // Keep y constant
  } else {
    // Ensure minimum width of one cell
    const maxX = lineAttributes.value.p2x - cellStore.getCellHorizontalWidth();
    lineAttributes.value.p1x = Math.min(maxX, snapToCell(p.x));
    lineAttributes.value.p1y = lineAttributes.value.p2y; // Keep y constant
  }
}

// Remove or simplify slope-related code since division lines are always horizontal
const modifyRight = computed(() => {
  return lineAttributes.value.p2x > lineAttributes.value.p1x;
});

// Watch for any change in lineAttributes's properties
watch(
  lineAttributes,
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
  return editModeStore.isDivisionLineMode();
});

let handleLeft = computed(() => {
  return lineAttributes.value.p1x + (cellStore.getSvgBoundingRect().left ?? 0);
});

let handleRight = computed(() => {
  return lineAttributes.value.p2x + (cellStore.getSvgBoundingRect().left ?? 0);
});

let handleTop = computed(() => {
  return lineAttributes.value.p1y + (cellStore.getSvgBoundingRect().top ?? 0);
});

let handleBottom = computed(() => {
  return lineAttributes.value.p2y + (cellStore.getSvgBoundingRect().top ?? 0);
});

function setInitialPosition(p: DotCoordinates) {
  // Snap to cell borders
  const cellY =
    Math.round(p.y / cellStore.getCellVerticalHeight()) *
    cellStore.getCellVerticalHeight();

  lineAttributes.value = {
    p1x: p.x,
    p2x: p.x + cellStore.getCellHorizontalWidth(), // Minimum width of one cell
    p1y: cellY,
    p2y: cellY, // Keep y position constant for horizontal line
    dashed: false,
    arrowLeft: false,
    arrowRight: false,
  };
}

function selectLine(notation: NotationAttributes) {
  const n = notation as LineNotationAttributes;

  lineAttributes.value.p1x = n.p1x;
  lineAttributes.value.p2x = n.p2x;
  lineAttributes.value.p1y = n.p1y;
  lineAttributes.value.p2y = n.p2y;
}

function modifyLineLeft(p: DotCoordinates) {
  lineAttributes.value.p1x = p.x;
  lineAttributes.value.p1y = p.y;
}

function modifyLineRight(p: DotCoordinates) {
  lineAttributes.value.p2x = p.x;
  lineAttributes.value.p2y = p.y;
}

async function saveLine(): Promise<string> {
  lineAttributes.value.p1x = getAdjustedEdge({
    x: lineAttributes.value.p1x,
    y: lineAttributes.value.p1y,
  }).x;

  lineAttributes.value.p1y = getAdjustedEdge({
    x: lineAttributes.value.p1x,
    y: lineAttributes.value.p1y,
  }).y;

  lineAttributes.value.p2x = getAdjustedEdge({
    x: lineAttributes.value.p2x,
    y: lineAttributes.value.p2y,
  }).x;

  lineAttributes.value.p2y = getAdjustedEdge({
    x: lineAttributes.value.p2x,
    y: lineAttributes.value.p2y,
  }).y;

  if (notationStore.getSelectedNotations().length > 0) {
    let updatedLine = {
      ...notationStore.getSelectedNotations().at(0)!,
      ...lineAttributes.value,
    };

    notationMutateHelper.updateLineNotation(
      updatedLine as LineNotationAttributes,
    );
    return updatedLine.uuid;
  } else {
    return notationMutateHelper.addLineNotation(
      lineAttributes.value,
      "DIVISIONLINE",
    );
  }
}

function getAdjustedEdge(point: DotCoordinates): DotCoordinates {
  // Snap to cell borders
  const cellY = Math.round(
    Math.round(point.y / cellStore.getCellVerticalHeight()) *
      cellStore.getCellVerticalHeight(),
  );
  const cellX = Math.round(
    Math.round(point.x / cellStore.getCellHorizontalWidth()) *
      cellStore.getCellHorizontalWidth(),
  );

  return {
    x: cellX,
    y: cellY,
  };
}

function applyMoveToLine(dx: number, dy: number) {
  lineAttributes.value.p1y += dy;
  lineAttributes.value.p2y += dy;
  lineAttributes.value.p1x += dx;
  lineAttributes.value.p2x += dx;
}

function moveLine(moveX: number, moveY: number) {
  applyMoveToLine(moveX, moveY);
  saveLine();
}

function moveLineByKey(moveX: number, moveY: number) {
  applyMoveToLine(moveX, moveY);
  saveLine();
}
</script>
<style scoped>
.line {
  stroke: black;
  stroke-width: 2;
  /* Add a small gap above and below for division notation */
  stroke-dasharray: none;
}
</style>
