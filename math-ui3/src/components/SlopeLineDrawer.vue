<template>
  <div v-show="show">
    <line-handle
      drawing-mode="SLOPE_LINE_DRAWING"
      editing-mode="SLOPE_LINE_EDITING_LEFT"
      v-bind:style="{
        left: handleLeft + 'px',
        top: handleTop + 'px',
      }"
    ></line-handle>
    <line-handle
      drawing-mode="SLOPE_LINE_DRAWING"
      editing-mode="SLOPE_LINE_EDITING_RIGHT"
      v-bind:style="{
        left: handleRight + 'px',
        top: handleBottom + 'px',
      }"
    ></line-handle>

    <svg
      height="800"
      width="1500"
      xmlns="http://www.w3.org/2000/svg"
      style="position: absolute; pointer-events: none"
    >
      <line
        :x1="slopeDrawerAttributes.linePosition.p1x"
        :y1="slopeDrawerAttributes.linePosition.p1y"
        :x2="slopeDrawerAttributes.linePosition.p2x"
        :y2="slopeDrawerAttributes.linePosition.p2y"
        class="line"
      />
    </svg>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { SlopeDrawerAttributes } from "../../../math-common/src/baseTypes";
import useWatchHelper from "../helpers/watchHelper";
import useLineDrawer from "../helpers/lineDrawingHelper";
import useSlopeLineDrawer from "../helpers/slopeLineDrawingHelper";
import lineHandle from "./LineHandle.vue";

const watchHelper = useWatchHelper();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();
const lineDrawer = useLineDrawer();
const slopeLineDrawer = useSlopeLineDrawer();

// vars

const slopeDrawerAttributes = ref<SlopeDrawerAttributes>({
  linePosition: {
    p1x: 0,
    p2x: 0,
    p1y: 0,
    p2y: 0,
  },
  slopeType: "NONE",
  movementDirection: "NONE",
});

// computed

const show = computed(() => {
  return (
    editModeStore.isSlopeLineDrawingMode() ||
    editModeStore.isSlopeLineSelectedMode() ||
    editModeStore.isSlopeLineEditingMode()
  );
});

let handleLeft = computed(() => {
  return (
    slopeDrawerAttributes.value.linePosition.p1x +
    (cellStore.getSvgBoundingRect().left ?? 0)
  );
});

let handleRight = computed(() => {
  return (
    slopeDrawerAttributes.value.linePosition.p2x +
    (cellStore.getSvgBoundingRect().left ?? 0)
  );
});

let handleTop = computed(() => {
  return (
    slopeDrawerAttributes.value.linePosition.p1y +
    (cellStore.getSvgBoundingRect().top ?? 0)
  );
});

let handleBottom = computed(() => {
  return (
    slopeDrawerAttributes.value.linePosition.p2y +
    (cellStore.getSvgBoundingRect().top ?? 0)
  );
});

// watchers

watchHelper.watchMouseEvent(["SLOPE_LINE_STARTED"], "EV_SVG_MOUSEDOWN", (e) =>
  slopeLineDrawer.startDrawingSlopeLine(e, slopeDrawerAttributes.value),
);

watchHelper.watchMouseEvent(
  ["SLOPE_LINE_DRAWING"],
  "EV_SVG_MOUSEMOVE",
  (e: MouseEvent) =>
    slopeLineDrawer.setNewSlopeLine(e, slopeDrawerAttributes.value),
);

watchHelper.watchMouseEvent(
  ["SLOPE_LINE_EDITING_LEFT"],
  "EV_SVG_MOUSEMOVE",
  (e: MouseEvent) =>
    slopeLineDrawer.setExistingSlopeLine(e, slopeDrawerAttributes.value, false),
);

watchHelper.watchMouseEvent(
  ["SLOPE_LINE_EDITING_RIGHT"],
  "EV_SVG_MOUSEMOVE",
  (e: MouseEvent) =>
    slopeLineDrawer.setExistingSlopeLine(e, slopeDrawerAttributes.value, true),
);

// emmited by selection helper
watchHelper.watchNotationSelection(
  "SLOPE_LINE_SELECTED",
  "EV_SLOPE_LINE_SELECTED",
  (notation) =>
    lineDrawer.selectLine(notation, slopeDrawerAttributes.value.linePosition),
);

watchHelper.watchEditModeTransition(
  ["SLOPE_LINE_DRAWING", "SLOPE_LINE_EDITING_LEFT", "SLOPE_LINE_EDITING_RIGHT"],
  "SYMBOL",
  () => slopeLineDrawer.endDrawingSlopeLine(slopeDrawerAttributes.value),
);

watchHelper.watchMouseEvent(["SLOPE_LINE_SELECTED"], "EV_SVG_MOUSEDOWN", () =>
  lineDrawer.resetDrawing(slopeDrawerAttributes.value.linePosition),
);
</script>
