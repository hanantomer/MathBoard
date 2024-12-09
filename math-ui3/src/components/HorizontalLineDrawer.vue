<!-- TODO: create component for line handles -->
<template>
  <div v-if="show">
    <v-card
      id="lineLeftHandle"
      class="lineHandle"
      v-bind:style="{
        left: handleLeft + 'px',
        top: handleY + 'px',
      }"
      v-on:mouseup="() => lineDrawer.endDrawingHorizontalLine(linePosition)"
      v-on:mousedown="
        (e) => lineDrawer.startDrawingHorizontalLine(e, linePosition)
      "
    ></v-card>
    <v-card
      id="lineRightHandle"
      class="lineHandle"
      v-bind:style="{
        left: handleRight + 'px',
        top: handleY + 'px',
      }"
      v-on:mouseup="() => lineDrawer.endDrawingHorizontalLine(linePosition)"
      v-on:mousedown="
        (e) => lineDrawer.startDrawingHorizontalLine(e, linePosition)
      "
    ></v-card>
    <svg
      height="800"
      width="1500"
      xmlns="http://www.w3.org/2000/svg"
      style="position: absolute; pointer-events: none"
    >
      <line
        :x1="lineLeft"
        :y1="lineY"
        :x2="lineRight"
        :y2="lineY"
        class="line"
      />
    </svg>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { HorizontalLineAttributes } from "../../../math-common/src/baseTypes";

import useWatchHelper from "../helpers/watchHelper";
import useLineDrawer from "../helpers/lineDrawingHelper";

const cellStore = useCellStore();
const editModeStore = useEditModeStore();
const watchHelper = useWatchHelper();
const lineDrawer = useLineDrawer();

// vars

let linePosition = ref(<HorizontalLineAttributes>{
  p1x: 0,
  p2x: 0,
  py: 0,
});

// computed

const show = computed(() => {
  return (
    editModeStore.isHorizontalLineDrawingMode() ||
    editModeStore.isHorizontalLineSelectedMode()
  );
});

let lineLeft = computed(() => {
  return linePosition.value.p1x;
});

let lineRight = computed(() => {
  return linePosition.value.p2x;
});

let lineY = computed(() => {
  return linePosition.value.py;
});

let handleLeft = computed(() => {
  return lineLeft.value + (cellStore.getSvgBoundingRect().left ?? 0) - 1;
});

let handleRight = computed(() => {
  return lineRight.value + (cellStore.getSvgBoundingRect().left ?? 0) + 1;
});

let handleY = computed(() => {
  return lineY.value + (cellStore.getSvgBoundingRect().top ?? 0) - 1;
});

// watchers

watchHelper.watchMouseEvent(
  ["HORIZONTAL_LINE_STARTED"],
  "EV_SVG_MOUSEDOWN",
  (e) => lineDrawer.startDrawingHorizontalLine(e, linePosition.value),
);

watchHelper.watchMouseEvent(
  ["HORIZONTAL_LINE_DRAWING"],
  "EV_SVG_MOUSEMOVE",
  (e) => lineDrawer.setHorizontalLine(e, linePosition.value),
);

watchHelper.watchMouseEvent(["HORIZONTAL_LINE_DRAWING"], "EV_SVG_MOUSEUP", () =>
  lineDrawer.endDrawingHorizontalLine(linePosition.value),
);

// emmited by selection helper
watchHelper.watchNotationSelection(
  "HORIZONTAL_LINE_SELECTED",
  "EV_HORIZONTAL_LINE_SELECTED",
  (notation) => lineDrawer.selectLine(notation, linePosition.value),
);

watchHelper.watchMouseEvent(
  ["HORIZONTAL_LINE_SELECTED"],
  "EV_SVG_MOUSEDOWN",
  () => lineDrawer.resetDrawing(linePosition.value),
);

watchHelper.watchMouseEvent(
  ["HORIZONTAL_LINE_SELECTED"],
  "EV_SVG_MOUSEUP",
  () => editModeStore.setDefaultEditMode(),
);
</script>
