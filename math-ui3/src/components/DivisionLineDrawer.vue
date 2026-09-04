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
      v-show="handlesInteractive"
      drawing-mode="DIVISIONLINE_DRAWING"
      editing-mode="DIVISIONLINE_EDITING_LEFT"
      v-bind:style="{
        left: handleLeft + 'px',
        top: handleTop + 'px',
      }"
    ></line-handle>
    <line-handle
      data-cy="divisionLineRightHandle"
      v-show="handlesInteractive"
      drawing-mode="DIVISIONLINE_DRAWING"
      editing-mode="DIVISIONLINE_EDITING_RIGHT"
      v-bind:style="{
        left: handleRight + 'px',
        top: handleBottom + 'px',
      }"
    ></line-handle>

    <svg
      :style="lineSvgScreenStyle"
      :viewBox="overlayViewBox"
      preserveAspectRatio="none"
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
import { computed, nextTick, ref, watch } from "vue";
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
import lineHandle, { LINE_HANDLE_HALF } from "./LineHandle.vue";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import { matrixSize } from "common/globals";
import {
  getBoardSvgUserExtent,
  svgUserToViewport,
} from "../helpers/pointerCoordinateHelper";

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

watch(
  () => ({
    mode: editModeStore.getEditMode(),
    selected: notationStore.getSelectedNotations()[0],
  }),
  ({ mode, selected }) => {
    if (selected?.notationType !== "DIVISIONLINE" || mode !== "DIVISIONLINE_SELECTED") {
      return;
    }
    selectLine(selected);
  },
);

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

const handlesInteractive = computed(
  () =>
    editModeStore.isDivisionLineSelectedMode() ||
    editModeStore.isDivisionLineEditingMode(),
);

const show = computed(() => {
  return editModeStore.isDivisionLineMode();
});

watch(show, async (visible) => {
  if (visible) {
    await nextTick();
    const id = cellStore.getSvgId();
    if (id) {
      cellStore.setSvgBoundingRect(id);
    }
  }
});

/** Same viewport box as the board SVG; viewBox maps overlay user units onto that box. */
const overlayViewBox = computed(() => {
  cellStore.getSvgBoundingRect();
  const e = getBoardSvgUserExtent();
  if (!e.width || !e.height) {
    return undefined;
  }
  return `${e.x} ${e.y} ${e.width} ${e.height}`;
});

const lineSvgScreenStyle = computed(() => {
  const r = cellStore.getSvgBoundingRect();
  return {
    position: "fixed" as const,
    top: `${r.top}px`,
    left: `${r.left}px`,
    width: r.width ? `${r.width}px` : matrixSize.width,
    height: r.height ? `${r.height}px` : matrixSize.height,
    margin: "0",
    overflow: "visible",
    zIndex: 998,
    pointerEvents: "none" as const,
  };
});

const HANDLE_HALF = LINE_HANDLE_HALF;

let handleLeft = computed(() => {
  cellStore.getSvgBoundingRect();
  return svgUserToViewport(lineAttributes.value.p1x, lineAttributes.value.p1y).x - HANDLE_HALF;
});

let handleRight = computed(() => {
  cellStore.getSvgBoundingRect();
  return svgUserToViewport(lineAttributes.value.p2x, lineAttributes.value.p1y).x - HANDLE_HALF;
});

let handleTop = computed(() => {
  cellStore.getSvgBoundingRect();
  return svgUserToViewport(lineAttributes.value.p1x, lineAttributes.value.p1y).y - HANDLE_HALF;
});

let handleBottom = computed(() => {
  cellStore.getSvgBoundingRect();
  return svgUserToViewport(lineAttributes.value.p2x, lineAttributes.value.p1y).y - HANDLE_HALF;
});

function setInitialPosition(p: DotCoordinates) {
  const point = roundPoint(p);

  // Snap to cell borders
  const cellY =
    Math.round(point.y / cellStore.getCellVerticalHeight()) *
    cellStore.getCellVerticalHeight();

  lineAttributes.value = {
    p1x: point.x,
    p2x: point.x + cellStore.getCellHorizontalWidth(), // Minimum width of one cell
    p1y: cellY,
    p2y: cellY, // Keep y position constant for horizontal line
    dashed: false,
    arrowLeft: false,
    arrowRight: false,
  };
}

function roundPoint(point: DotCoordinates): DotCoordinates {
  return {
    x: Math.round(point.x),
    y: Math.round(point.y),
  };
}

function selectLine(notation: NotationAttributes) {
  const n = notation as LineNotationAttributes;

  lineAttributes.value.p1x = n.p1x;
  lineAttributes.value.p2x = n.p2x;
  lineAttributes.value.p1y = n.p1y;
  lineAttributes.value.p2y = n.p1y;
}

function modifyLineLeft(p: DotCoordinates) {
  const point = roundPoint(p);
  lineAttributes.value.p1x = point.x;
  lineAttributes.value.p1y = lineAttributes.value.p2y;
}

function modifyLineRight(p: DotCoordinates) {
  const point = roundPoint(p);
  lineAttributes.value.p2x = point.x;
  lineAttributes.value.p2y = lineAttributes.value.p1y;
}

async function saveLine(): Promise<string> {
  const p1 = getAdjustedEdge({
    x: lineAttributes.value.p1x,
    y: lineAttributes.value.p1y,
  });
  const p2 = getAdjustedEdge({
    x: lineAttributes.value.p2x,
    y: lineAttributes.value.p1y,
  });
  lineAttributes.value.p1x = Math.round(p1.x);
  lineAttributes.value.p1y = Math.round(p1.y);
  lineAttributes.value.p2x = Math.round(p2.x);
  lineAttributes.value.p2y = lineAttributes.value.p1y;

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
