<template>
  <div v-if="show">
    <v-card
      id="lineLeftHandle"
      class="lineHandle"
      v-bind:style="{
        left: handleLeft + 'px',
        top: handleY + 'px',
      }"
      v-on:mouseup="lineDrawer.endDrawingLine"
      v-on:mousedown="lineDrawer.startDrawingLine"
      v-if="!sqrtEditMode"
    ></v-card>
    <v-card
      id="lineRightHandle"
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
import useNotationMutateHelper from "../helpers/notationMutateHelper";

import { computed, ref } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { cellSpace } from "../../../math-common/src/globals";

import { HorizontaLinePosition } from "../../../math-common/src/baseTypes";

import {
  HorizontalLineAttributes,
  HorizontalLineNotationAttributes,
} from "../../../math-common/src/baseTypes";

import useWatchHelper from "../helpers/watchHelper";
import useLineDrawer from "../helpers/lineDrawingHelper";

const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();
const watchHelper = useWatchHelper();
const lineDrawer = useLineDrawer();

// vars

let linePosition = ref(<HorizontaLinePosition>{
  x1: 0,
  x2: 0,
  y: 0,
});

// computed

const sqrtEditMode = computed(() => {
  return editModeStore.isSqrtEditMode();
});

const show = computed(() => {
  return (
    editModeStore.isHorizontalLineDrawingMode() ||
    editModeStore.isHorizontalLineSelectedMode()
  );
});

let lineLeft = computed(() => {
  return linePosition.value.x1;
});

let lineRight = computed(() => {
  return linePosition.value.x2;
});

let lineY = computed(() => {
  return linePosition.value.y;
});

let handleLeft = computed(() => {
  return lineLeft.value + (cellStore.getSvgBoundingRect().left ?? 0) - 10;
});

let handleRight = computed(() => {
  return lineRight.value + (cellStore.getSvgBoundingRect().left ?? 0) + 10;
});

let handleY = computed(() => {
  return lineY.value + (cellStore.getSvgBoundingRect().top ?? 0) - 5;
});

// watchers

watchHelper.watchMouseEvent(
  ["HORIZONTAL_LINE_STARTED"],
  "EV_SVG_MOUSEDOWN",
  (e) => lineDrawer.startDrawingLine(e, linePosition.value),
);

watchHelper.watchMouseEvent(
  ["HORIZONTAL_LINE_DRAWING"],
  "EV_SVG_MOUSEMOVE",
  (e) => lineDrawer.setLine(e, linePosition.value),
);

watchHelper.watchMouseEvent(["HORIZONTAL_LINE_DRAWING"], "EV_SVG_MOUSEUP", () =>
  lineDrawer.endDrawingLine(linePosition.value),
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
  () => lineDrawer.resetLineDrawing(linePosition.value),
);

watchHelper.watchMouseEvent(
  ["HORIZONTAL_LINE_SELECTED"],
  "EV_SVG_MOUSEUP",
  () => editModeStore.setDefaultEditMode(),
);

</script>
