<template>
  <div v-if="show">
    <v-card
      id="sqrtRightHandle"
      class="lineHandle"
      v-bind:style="{
        left: handleRight + 'px',
        top: handleY + 'px',
      }"
      v-on:mouseup="lineDrawer.endDrawingLine"
      v-on:mousedown="lineDrawer.startDrawingLine"
    ></v-card>
    <svg
      height="800"
      width="1500"
      xmlns="http://www.w3.org/2000/svg"
      style="position: absolute; pointer-events: none"
    >
      <line
        :x1="sqrtLeft"
        :y1="sqrtY"
        :x2="sqrtRight"
        :y2="sqrtY"
        class="line"
      />
    </svg>
    <p
      class="sqrtsymbol"
      v-bind:style="{
        left: sqrtSymbolLeft + 'px',
        top: sqrtSymbolY + 'px',
      }"
    >
      &#x221A;
    </p>
  </div>
</template>
<script setup lang="ts">
import useWatchHelper from "../helpers/watchHelper";

import { computed, ref } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";

import { HorizontaLinePosition } from "../../../math-common/src/baseTypes";

import { SqrtNotationAttributes } from "../../../math-common/src/baseTypes";
import useEventBus from "../helpers/eventBusHelper";
import useLineDrawingHelper from "../helpers/lineDrawingHelper";

const eventBus = useEventBus();
const watchHelper = useWatchHelper();
const lineDrawer = useLineDrawingHelper();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();

// vars

let linePosition = ref(<HorizontaLinePosition>{
  x1: 0,
  x2: 0,
  y: 0,
});

const show = computed(() => {
  return editModeStore.isSqrtEditMode() || editModeStore.isSqrtSelectedMode();
});

let sqrtRight = computed(() => {
  return linePosition.value.x2;
});

let sqrtLeft = computed(() => {
  return linePosition.value.x1 + cellStore.getCellHorizontalWidth();
});

let sqrtY = computed(() => {
  return linePosition.value.y;
});

let sqrtSymbolLeft = computed(() => {
  return linePosition.value.x1 + (cellStore.getSvgBoundingRect().left ?? 0) - 6;
});

let sqrtSymbolY = computed(() => {
  return linePosition.value.y + (cellStore.getSvgBoundingRect().top ?? 0) - 5;
});

let handleRight = computed(() => {
  return sqrtRight.value + (cellStore.getSvgBoundingRect().left ?? 0) + 10;
});

let handleY = computed(() => {
  return sqrtY.value + (cellStore.getSvgBoundingRect().top ?? 0) - 5;
});

watchHelper.watchMouseEvent(["SQRT_STARTED"], "EV_SVG_MOUSEDOWN", (e) =>
  lineDrawer.startDrawingLine(e, linePosition.value),
);

watchHelper.watchMouseEvent(["SQRT_DRAWING"], "EV_SVG_MOUSEMOVE", (e) =>
  lineDrawer.setLine(e, linePosition.value),
);

watchHelper.watchMouseEvent(["SQRT_DRAWING"], "EV_SVG_MOUSEUP", () =>
  lineDrawer.endDrawingSqrt(linePosition.value),
);

watchHelper.watchNotationSelection(
  "SQRT_SELECTED",
  "EV_SQRT_SELECTED",
  (notation) => lineDrawer.selectLine(notation, linePosition.value),
);

watchHelper.watchMouseEvent(["SQRT_SELECTED"], "EV_SVG_MOUSEUP", () =>
  editModeStore.setDefaultEditMode(),
);

watchHelper.watchMouseEvent(["SQRT_DRAWING"], "EV_SVG_MOUSEDOWN", () =>
  lineDrawer.resetLineDrawing(linePosition.value),
);

// event handlers

function selectSqrt(sqrtNotation: SqrtNotationAttributes) {
  // set selection sqrt

  linePosition.value.x1 =
    sqrtNotation.fromCol * cellStore.getCellHorizontalWidth();
  (linePosition.value.x2 =
    (sqrtNotation.toCol - 1) * cellStore.getCellHorizontalWidth()),
    (linePosition.value.y =
      sqrtNotation.row * cellStore.getCellVerticalHeight());

  // update store
  notationStore.selectNotation(sqrtNotation.uuid);

  // to enable re selection
  eventBus.emit("EV_SQRT_SELECTED", null);
}

function onHandleMouseDown() {
  editModeStore.setNextEditMode();
}
</script>
