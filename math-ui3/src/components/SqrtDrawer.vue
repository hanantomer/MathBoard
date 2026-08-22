<template>
  <lineWatcher
    :startEntry="{
      editMode: ['SQRT_STARTED'],
      func: setInitialPosition,
    }"
    :drawEntry="{
      editMode: ['SQRT_DRAWING'],
      func: drawLine,
    }"
    :editEntryFirstHandle="{
      editMode: ['SQRT_EDITING'],
      func: modify,
    }"
    :editEntrySecondHandle="{
      editMode: ['SQRT_EDITING'],
      func: modify,
    }"
    :saveEntry="{
      editMode: ['SQRT_DRAWING', 'SQRT_EDITING'],
      func: endDrawing,
    }"
    :selectEntry="{
      editMode: ['SQRT_SELECTED'],
      func: selectSqrt,
      event: 'EV_SQRT_SELECTED',
    }"
    :moveByKeyEntry="{
      editMode: ['SQRT_SELECTED'],
      func: moveSqrt,
    }"
    :endEntry="{
      editMode: ['SQRT_SELECTED'],
    }"
  />
  <div v-if="show">
    <line-handle
      data-cy="sqrtRightHandle"
      drawing-mode="SQRT_DRAWING"
      editing-mode="SQRT_EDITING"
      v-bind:style="{
        left: handleX + 'px',
        top: handleY + 'px',
      }"
    >
    </line-handle>

    <svg
      :style="lineSvgScreenStyle"
      xmlns="http://www.w3.org/2000/svg"
      class="line-svg"
    >
      <line
        :x1="sqrtLine.x1"
        :y1="sqrtLine.y"
        :x2="sqrtLine.x2"
        :y2="sqrtLine.y"
        class="sqrt"
        stroke="black"
        data-cy="sqrtDrawer"
      />
    </svg>
    <p
      class="sqrtsymbol"
      v-bind:style="{
        left: sqrtSymbolScreen.left + 'px',
        top: sqrtSymbolScreen.top + 'px',
      }"
    >
      &#x221A;
    </p>
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import {
  DotCoordinates,
  SqrtNotationAttributes,
  NotationAttributes,
  MultiCellAttributes,
  LineAttributes,
} from "common/baseTypes";

import lineHandle from "./LineHandle.vue";
import lineWatcher from "./LineWatcher.vue";

import { matrixSize } from "common/globals";

/**
 * Must stay in sync with matrixHtmlHelper.ts:
 * - x(): SQRTSYMBOL deltaX -7
 * - y(): SQRTSYMBOL y += 2 (row * cellHeight)
 * - col(): SQRT uses fromCol + 1 for line FO
 * - width(): SQRT line width
 * - generateSqrtHtml: margin-top 2px
 * - generateSqrtSymbolHtml: margin-top -2px, margin-left 10px
 */
const SQRT_SYMBOL_FO_DELTA_X = -7;
const SQRT_SYMBOL_FO_DELTA_Y = 2;
const SQRT_LINE_HTML_MARGIN_TOP = 2;
const SQRT_SYMBOL_HTML_MARGIN_LEFT = 10;
const SQRT_SYMBOL_HTML_MARGIN_TOP = -2;
/** Overlay-only tweak if a browser still misaligns vs matrix foreignObject. */
const SQRT_SYMBOL_EDITOR_Y_NUDGE = 0;
/** Vertical center of the 1px border band on the matrix .sqrt span (margin-top + ~1px). */
const SQRT_LINE_VINCULUM_CENTER_OFFSET = SQRT_LINE_HTML_MARGIN_TOP + 1;

const HANDLE_SIZE = 8;
const HANDLE_HALF = HANDLE_SIZE / 2;

const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationMutateHelper = useNotationMutateHelper();

let linePosition = ref(<LineAttributes>{
  p1x: 0,
  p2x: 0,
  p1y: 0,
  p2y: 0,
});

const show = computed(() => {
  return (
    editModeStore.isSqrtStartedMode() ||
    editModeStore.isSqrtDrawingMode() ||
    editModeStore.isSqrtEditMode() ||
    editModeStore.isSqrtSelectedMode()
  );
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

const lineSvgScreenStyle = computed(() => {
  const r = cellStore.getSvgBoundingRect();
  return {
    position: "fixed" as const,
    top: `${r.top}px`,
    left: `${r.left}px`,
    width: matrixSize.width,
    height: matrixSize.height,
    margin: "0",
    pointerEvents: "none" as const,
  };
});

/** Grid indices derived from linePosition (viewport x / board y). */
const sqrtGrid = computed(() => {
  const r = cellStore.getSvgBoundingRect();
  const w = cellStore.getCellHorizontalWidth();
  const h = cellStore.getCellVerticalHeight();
  const fromCol = Math.round((linePosition.value.p1x - r.left) / w);
  const toCol = Math.round((linePosition.value.p2x - r.left) / w);
  const row = Math.round(linePosition.value.p1y / h);
  return { fromCol, toCol, row };
});

/** SVG user-space coords (same origin as matrix foreignObjects). */
const sqrtLine = computed(() => {
  const g = sqrtGrid.value;
  const w = cellStore.getCellHorizontalWidth();
  const h = cellStore.getCellVerticalHeight();
  const x1 = (g.fromCol + 1) * w;
  const x2 = g.toCol * w;
  const y = g.row * h + SQRT_LINE_VINCULUM_CENTER_OFFSET;
  return { x1, x2, y };
});

/** Viewport px for the √ paragraph (matrix: foreignObject + inner margins). */
const sqrtSymbolScreen = computed(() => {
  const r = cellStore.getSvgBoundingRect();
  const g = sqrtGrid.value;
  const w = cellStore.getCellHorizontalWidth();
  const h = cellStore.getCellVerticalHeight();
  const foX = g.fromCol * w + SQRT_SYMBOL_FO_DELTA_X;
  const foY = g.row * h + SQRT_SYMBOL_FO_DELTA_Y;
  return {
    left: r.left + foX + SQRT_SYMBOL_HTML_MARGIN_LEFT,
    top:
      r.top +
      foY +
      SQRT_SYMBOL_HTML_MARGIN_TOP +
      SQRT_SYMBOL_EDITOR_Y_NUDGE,
  };
});

let handleX = computed(() => {
  return linePosition.value.p2x - HANDLE_HALF;
});

let handleY = computed(() => {
  const r = cellStore.getSvgBoundingRect();
  return r.top + sqrtLine.value.y - HANDLE_HALF;
});

function setInitialPosition(p: DotCoordinates) {
  const r = cellStore.getSvgBoundingRect();
  const w = cellStore.getCellHorizontalWidth();
  const h = cellStore.getCellVerticalHeight();
  const cellY = Math.round(p.y / h) * h;

  linePosition.value.p1x = r.left + p.x;
  linePosition.value.p2x = r.left + p.x + w;
  linePosition.value.p1y = cellY;
  linePosition.value.p2y = cellY;
}

function drawLine(p: DotCoordinates) {
  linePosition.value.p2x = p.x + cellStore.getSvgBoundingRect().left;
}

async function endDrawing(): Promise<string> {
  const fromCol = Math.round(
    (linePosition.value.p1x - cellStore.getSvgBoundingRect().left) /
      cellStore.getCellHorizontalWidth(),
  );

  let toCol = Math.round(
    (linePosition.value.p2x - cellStore.getSvgBoundingRect().left) /
      cellStore.getCellHorizontalWidth(),
  );

  let row = Math.round(
    linePosition.value.p1y / cellStore.getCellVerticalHeight(),
  );
  const uuid = await saveSqrt({ fromCol: fromCol, toCol: toCol, row: row });
  return uuid;
}

function modify(p: DotCoordinates) {
  linePosition.value.p2x = p.x + cellStore.getSvgBoundingRect().left;
}

async function saveSqrt(sqrtAttributes: MultiCellAttributes): Promise<string> {
  if (notationStore.getSelectedNotations().length > 0) {
    let updatedSqrt = {
      ...notationStore.getSelectedNotations().at(0)!,
      ...sqrtAttributes,
    };

    return await notationMutateHelper.updateSqrtNotation(updatedSqrt);
  } else {
    return await notationMutateHelper.addSqrtNotation(sqrtAttributes);
  }
}

function selectSqrt(notation: NotationAttributes) {
  const n = notation as SqrtNotationAttributes;

  linePosition.value.p1x =
    n.fromCol * cellStore.getCellHorizontalWidth() +
    cellStore.getSvgBoundingRect().left;

  linePosition.value.p2x =
    n.toCol * cellStore.getCellHorizontalWidth() +
    cellStore.getSvgBoundingRect().left;

  linePosition.value.p1y =
    n.row * cellStore.getCellVerticalHeight();

  linePosition.value.p2y = linePosition.value.p1y;
}

function moveSqrt(moveX: number, moveY: number) {
  linePosition.value.p1x += moveX;
  linePosition.value.p2x += moveX;
  linePosition.value.p1y += moveY;
  linePosition.value.p2y += moveY;
}
</script>
