<template>
  <div v-show="show">
    <lineWatcher
      :startEntry="{
        editMode: ['DIVISION_LINE_STARTED'],
        func: setInitialPosition,
      }"
      :drawEntry="{
        editMode: ['DIVISION_LINE_DRAWING'],
        func: drawLine,
      }"
      :editEntryFirstHandle="{
        editMode: ['DIVISION_LINE_EDITING_LEFT'],
        func: modifyLineLeft,
      }"
      :editEntrySecondHandle="{
        editMode: ['DIVISION_LINE_EDITING_RIGHT'],
        func: modifyLineRight,
      }"
      :saveEntry="{
        editMode: [
          'DIVISION_LINE_DRAWING',
          'DIVISION_LINE_EDITING_RIGHT',
          'DIVISION_LINE_EDITING_LEFT',
        ],
        func: saveLine,
      }"
      :selectEntry="{
        editMode: ['DIVISION_LINE_SELECTED'],
        func: selectLine,
        event: 'EV_DIVISION_LINE_SELECTED',
      }"
      :moveByKeyEntry="{
        editMode: ['DIVISION_LINE_SELECTED'],
        func: moveLine,
      }"
      :endEntry="{
        editMode: ['DIVISION_LINE_SELECTED'],
      }"
    />
    <line-handle
      v-show="editModeStore.isDivisionLineMode()"
      drawing-mode="DIVISION_LINE_DRAWING"
      editing-mode="DIVISION_LINE_EDITING_LEFT"
      v-bind:style="{
        left: handleLeft + 'px',
        top: handleTop + 'px',
      }"
    ></line-handle>
    <line-handle
      v-show="editModeStore.isDivisionLineMode()"
      drawing-mode="DIVISION_LINE_DRAWING"
      editing-mode="DIVISION_LINE_EDITING_RIGHT"
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
        :y2="linePosition.p1y"
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
  LineAttributes,
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

const linePosition = ref<LineAttributes>({
  p1x: 0,
  p2x: 0,
  p1y: 0,
  p2y: 0,
});

// Modify the drawLine function to ensure horizontal lines
function drawLine(p: DotCoordinates) {
  // Ensure x positions snap to cell width increments
  const snapToCell = (x: number) =>
    Math.round(x / cellStore.getCellHorizontalWidth()) *
    cellStore.getCellHorizontalWidth();

  if (modifyRight.value) {
    // Ensure minimum width of one cell
    const minX = linePosition.value.p1x + cellStore.getCellHorizontalWidth();
    linePosition.value.p2x = Math.max(minX, snapToCell(p.x));
    linePosition.value.p2y = linePosition.value.p1y; // Keep y constant
  } else {
    // Ensure minimum width of one cell
    const maxX = linePosition.value.p2x - cellStore.getCellHorizontalWidth();
    linePosition.value.p1x = Math.min(maxX, snapToCell(p.x));
    linePosition.value.p1y = linePosition.value.p2y; // Keep y constant
  }
}

// Remove or simplify slope-related code since division lines are always horizontal
const modifyRight = computed(() => {
  return linePosition.value.p2x > linePosition.value.p1x;
});

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
  return editModeStore.isDivisionLineMode();
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
  // Snap to cell borders
  const cellY =
    Math.round(p.y / cellStore.getCellVerticalHeight()) *
    cellStore.getCellVerticalHeight();

  linePosition.value = {
    p1x: p.x,
    p2x: p.x + cellStore.getCellHorizontalWidth(), // Minimum width of one cell
    p1y: cellY,
    p2y: cellY, // Keep y position constant for horizontal line
  };
}

function selectLine(notation: NotationAttributes) {
  const n = notation as LineNotationAttributes;

  linePosition.value.p1x = n.p1x;
  linePosition.value.p2x = n.p2x;
  linePosition.value.p1y = n.p1y;
  linePosition.value.p2y = n.p2y;
}

function modifyLineLeft(p: DotCoordinates) {
  linePosition.value.p1x = p.x;
  linePosition.value.p1y = p.y;
}

function modifyLineRight(p: DotCoordinates) {
  linePosition.value.p2x = p.x;
  linePosition.value.p2y = p.y;
}

async function saveLine(): Promise<string> {
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

// Add validation for minimum width
function isValidLine(): boolean {
  return (
    Math.abs(linePosition.value.p2x - linePosition.value.p1x) >=
    cellStore.getCellHorizontalWidth()
  );
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
