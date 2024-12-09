<template>
  <div v-show="show">
    <v-card
      id="lineToptHandle"
      class="lineHandle"
      v-bind:style="{
        left: handleX + 'px',
        top: handleTop + 'px',
      }"
      v-on:mouseup="() => lineDrawer.endDrawingVerticalLine(linePosition)"
      v-on:mousedown="
        (e) => lineDrawer.startDrawingVerticalLine(e, linePosition)
      "
    ></v-card>
    <v-card
      id="lineBottomHandle"
      class="lineHandle"
      v-bind:style="{
        left: handleX + 'px',
        top: handleBottom + 'px',
      }"
      v-on:mouseup="() => lineDrawer.endDrawingVerticalLine(linePosition)"
      v-on:mousedown="
        (e) => lineDrawer.startDrawingVerticalLine(e, linePosition)
      "
    ></v-card>
    <svg
      height="800"
      width="1500"
      xmlns="http://www.w3.org/2000/svg"
      style="position: absolute; pointer-events: none"
    >
      <line
        :x1="linePosition.px"
        :y1="linePosition.p1y"
        :x2="linePosition.px"
        :y2="linePosition.p2y"
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
import useWatchHelper from "../helpers/watchHelper";
import useLineDrawer from "../helpers/lineDrawingHelper";

import {
  VerticalLineAttributes,
  VerticalLineNotationAttributes,
} from "../../../math-common/src/baseTypes";

const notationMutateHelper = useNotationMutateHelper();
const watchHelper = useWatchHelper();
const lineDrawer = useLineDrawer();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();

// vars

let linePosition = ref(<VerticalLineAttributes>{
  px: 0,
  p1y: 0,
  p2y: 0,
});

// computed

const show = computed(() => {
  return (
    editModeStore.isVerticalLineDrawingMode() ||
    editModeStore.isVerticalLineSelectedMode()
  );
});

let handleX = computed(() => {
  return linePosition.value.px + (cellStore.getSvgBoundingRect().left ?? 0) - 3;
});

let handleTop = computed(() => {
  if (!cellStore.getSvgBoundingRect()) return;
  return linePosition.value.p2y + (cellStore.getSvgBoundingRect().top ?? 0) - 3;
});

let handleBottom = computed(() => {
  if (!cellStore.getSvgBoundingRect()) return;
  return linePosition.value.p1y + (cellStore.getSvgBoundingRect().top ?? 0);
});

// watchers

watchHelper.watchMouseEvent(
  ["VERTICAL_LINE_STARTED"],
  "EV_SVG_MOUSEDOWN",
  (e: MouseEvent) => lineDrawer.startDrawingVerticalLine(e, linePosition.value),
);

watchHelper.watchMouseEvent(
  ["VERTICAL_LINE_DRAWING"],
  "EV_SVG_MOUSEMOVE",
  (e: MouseEvent) => lineDrawer.setVerticalLine(e, linePosition.value),
);

watchHelper.watchMouseEvent(["VERTICAL_LINE_DRAWING"], "EV_SVG_MOUSEUP", () =>
  lineDrawer.endDrawingVerticalLine(linePosition.value),
);

// emmited by selection helper
watchHelper.watchNotationSelection(
  "VERTICAL_LINE_SELECTED",
  "EV_VERTICAL_LINE_SELECTED",
  (notation: VerticalLineNotationAttributes) =>
    lineDrawer.selectLine(notation, linePosition.value),
);

watchHelper.watchMouseEvent(
  ["VERTICAL_LINE_SELECTED"],
  "EV_SVG_MOUSEDOWN",
  () => lineDrawer.resetDrawing(linePosition.value),
);

watchHelper.watchMouseEvent(["VERTICAL_LINE_SELECTED"], "EV_SVG_MOUSEUP", () =>
  editModeStore.setDefaultEditMode(),
);
</script>
