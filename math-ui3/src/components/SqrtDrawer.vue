<template>
  <div v-if="show">
    <line-handle
      drawing-mode="SQRT_DRAWING"
      editing-mode="SQRT_EDITING"
      v-bind:style="{
        left: handleRight + 'px',
        top: handleY + 'px',
      }"
    >
    </line-handle>

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
import { computed, ref } from "vue";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { HorizontalLineAttributes } from "../../../math-common/src/baseTypes";
import lineHandle from "./LineHandle.vue";
import useWatchHelper from "../helpers/watchHelper";
import useLineDrawer from "../helpers/lineDrawingHelper";
import useHorizontalLineDrawingHelper from "../helpers/horizontalLineDrawingHelper";

const cellStore = useCellStore();
const editModeStore = useEditModeStore();
const watchHelper = useWatchHelper();
const lineDrawer = useLineDrawer();
const horizontalLineDrawingHelper = useHorizontalLineDrawingHelper();

let linePosition = ref(<HorizontalLineAttributes>{
  p1x: 0,
  p2x: 0,
  py: 0,
});

const show = computed(() => {
  return (
    editModeStore.isSqrtDrawingMode() ||
    editModeStore.isSqrtEditMode() ||
    editModeStore.isSqrtSelectedMode()
  );
});

let sqrtRight = computed(() => {
  return linePosition.value.p2x;
});

let sqrtLeft = computed(() => {
  return linePosition.value.p1x + cellStore.getCellHorizontalWidth();
});

let sqrtY = computed(() => {
  return linePosition.value.py;
});

let sqrtSymbolLeft = computed(() => {
  return (
    linePosition.value.p1x + (cellStore.getSvgBoundingRect().left ?? 0) - 6
  );
});

let sqrtSymbolY = computed(() => {
  return linePosition.value.py + (cellStore.getSvgBoundingRect().top ?? 0) - 5;
});

let handleRight = computed(() => {
  return sqrtRight.value + (cellStore.getSvgBoundingRect().left ?? 0) + 10;
});

let handleY = computed(() => {
  return sqrtY.value + (cellStore.getSvgBoundingRect().top ?? 0) - 5;
});

watchHelper.watchMouseEvent(["SQRT_STARTED"], "EV_SVG_MOUSEDOWN", (e) =>
  horizontalLineDrawingHelper.startDrawingHorizontalLine(e, linePosition.value),
);

watchHelper.watchMouseEvent(["SQRT_DRAWING"], "EV_SVG_MOUSEMOVE", (e) =>
  horizontalLineDrawingHelper.setNewHorizontalLine(e, linePosition.value),
);

watchHelper.watchNotationSelection(
  "SQRT_SELECTED",
  "EV_SQRT_SELECTED",
  (notation) => lineDrawer.selectLine(notation, linePosition.value),
);

watchHelper.watchMouseEvent(["SQRT_EDITING"], "EV_SVG_MOUSEMOVE", (e) =>
  horizontalLineDrawingHelper.setExistingHorizontalLine(
    e,
    linePosition.value,
    true,
  ),
);

watchHelper.watchEditModeTransition(
  ["SQRT_DRAWING", "SQRT_EDITING"],
  "SYMBOL",
  () => horizontalLineDrawingHelper.endDrawingSqrt(linePosition.value),
);

watchHelper.watchMouseEvent(["SQRT_SELECTED"], "EV_SVG_MOUSEDOWN", () =>
  lineDrawer.resetDrawing(linePosition.value),
);
</script>
