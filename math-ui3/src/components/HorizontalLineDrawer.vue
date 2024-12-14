<!-- TODO: create component for line handles -->
<template>
  <div v-if="show">
    <!-- <v-card
      id="lineLeftHandle"
      class="lineHandle"
      v-bind:style="{
        left: handleLeft + 'px',
        top: handleY + 'px',
      }"
      v-on:mouseup="
        () =>
          horizontalLineDrawingHelper.endDrawingHorizontalLine(
            horizontalDrawerAttributes.linePosition,
          )
      "
      v-on:mousedown="
        (e) =>
          horizontalLineDrawingHelper.startEditingHorizontalLine(
            horizontalDrawerAttributes,
            false,
          )
      "
    ></v-card> -->
    <!-- <v-card
      id="lineRightHandle"
      class="lineHandle"
      v-bind:style="{
        left: handleRight + 'px',
        top: handleY + 'px',
      }"
      v-on:mouseup="
        () =>
          horizontalLineDrawingHelper.endDrawingHorizontalLine(
            horizontalDrawerAttributes.linePosition,
          )
      "
      v-on:mousedown="
        (e) =>
          horizontalLineDrawingHelper.startEditingHorizontalLine(
            horizontalDrawerAttributes,
            true,
          )
      "
    ></v-card> -->
   <line-handle
      edit-mode="HORIZONTAL_LINE_EDITING_LEFT"
      v-bind:style="{
        left: handleLeft + 'px',
        top: handleY + 'px',
      }"
    >
    </line-handle>

    <line-handle
      edit-mode="HORIZONTAL_LINE_EDITING_RIGHT"
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
import lineHandle from "./LineHandle.vue";

import useWatchHelper from "../helpers/watchHelper";
import useLineDrawer from "../helpers/lineDrawingHelper";
import { HorizontalLineAttributes } from "../../../math-common/src/baseTypes";
import useHorizontalLineDrawingHelper from "../helpers/horizontalLineDrawingHelper";

const cellStore = useCellStore();
const editModeStore = useEditModeStore();
const watchHelper = useWatchHelper();
const lineDrawer = useLineDrawer();
const horizontalLineDrawingHelper = useHorizontalLineDrawingHelper();

// vars

const linePosition  = ref<HorizontalLineAttributes>({
    p1x: 0,
    p2x: 0,
    py: 0,
});

// computed

const show = computed(() => {
  return (
    editModeStore.isHorizontalLineDrawingMode() ||
    editModeStore.isHorizontalLineSelectedMode() ||
    editModeStore.isHorizontalLineEditingMode()
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
  (e) =>
    horizontalLineDrawingHelper.startDrawingHorizontalLine(
      e,
      linePosition.value,
    ),
);

watchHelper.watchMouseEvent(
  ["HORIZONTAL_LINE_DRAWING"],
  "EV_SVG_MOUSEMOVE",
  (e) =>
    horizontalLineDrawingHelper.setNewHorizontalLine(
      e,
      linePosition.value,
    ),
);

watchHelper.watchMouseEvent(
  ["HORIZONTAL_LINE_EDITING_LEFT"],
  "EV_SVG_MOUSEMOVE",
  (e) =>
    horizontalLineDrawingHelper.setExistingHorizontalLine(
      e,
      linePosition.value,
      false
    ),
);

watchHelper.watchMouseEvent(
  ["HORIZONTAL_LINE_EDITING_RIGHT"],
  "EV_SVG_MOUSEMOVE",
  (e) =>
    horizontalLineDrawingHelper.setExistingHorizontalLine(
      e,
      linePosition.value,
      true
    ),
);


watchHelper.watchMouseEvent(
  ["HORIZONTAL_LINE_DRAWING", "HORIZONTAL_LINE_EDITING_LEFT", "HORIZONTAL_LINE_EDITING_RIGHT"],
  "EV_SVG_MOUSEUP",
  () =>
    horizontalLineDrawingHelper.endDrawingHorizontalLine(
      linePosition.value,
    ),
);

// emmited by selection helper
watchHelper.watchNotationSelection(
  "HORIZONTAL_LINE_SELECTED",
  "EV_HORIZONTAL_LINE_SELECTED",
  (notation) =>
    lineDrawer.selectLine(
      notation,
      linePosition.value,
    ),
);

watchHelper.watchMouseEvent(
  ["HORIZONTAL_LINE_SELECTED"],
  "EV_SVG_MOUSEDOWN",
  () => lineDrawer.resetDrawing(linePosition.value),
);

// watchHelper.watchMouseEvent(
//   ["HORIZONTAL_LINE_EDITING"],
//   "EV_SVG_MOUSEUP",
//   () => lineDrawer.endLineEditing(),
// );
</script>
