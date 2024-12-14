<template>
  <div v-show="show">
    <line-handle
      edit-mode="VERTICAL_LINE_EDITING_TOP"
      v-bind:style="{
        left: handleX + 'px',
        top: handleTop + 'px',
      }"
    ></line-handle>
    <line-handle
      edit-mode="VERTICAL_LINE_EDITING_BOTTOM"
      v-bind:style="{
        left: handleX + 'px',
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
import { computed, ref } from "vue";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import useWatchHelper from "../helpers/watchHelper";
import useLineDrawer from "../helpers/lineDrawingHelper";
import useVerticalLineDrawingHelper from "../helpers/verticalLineDrawingHelper";

import {
  VerticalLineNotationAttributes,
  VerticalLineAttributes,
} from "../../../math-common/src/baseTypes";
import lineHandle from "./LineHandle.vue";

const watchHelper = useWatchHelper();
const lineDrawer = useLineDrawer();
const verticalLineDrawer = useVerticalLineDrawingHelper();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();

// vars

const linePosition = ref<VerticalLineAttributes>({
  px: 0,
  p1y: 0,
  p2y: 0,
});

// computed

const show = computed(() => {
  return (
    editModeStore.isVerticalLineDrawingMode() ||
    editModeStore.isVerticalLineSelectedMode() ||
    editModeStore.isVerticalLineEditingMode()
  );
});

let handleX = computed(() => {
  return linePosition.value.px + (cellStore.getSvgBoundingRect().left ?? 0) - 3;
});

let handleBottom = computed(() => {
  if (!cellStore.getSvgBoundingRect()) return;
  return linePosition.value.p2y + (cellStore.getSvgBoundingRect().top ?? 0) - 3;
});

let handleTop = computed(() => {
  if (!cellStore.getSvgBoundingRect()) return;
  return linePosition.value.p1y + (cellStore.getSvgBoundingRect().top ?? 0);
});

// watchers

watchHelper.watchMouseEvent(
  ["VERTICAL_LINE_STARTED"],
  "EV_SVG_MOUSEDOWN",
  (e: MouseEvent) =>
    verticalLineDrawer.startDrawingVerticalLine(e, linePosition.value),
);

watchHelper.watchMouseEvent(
  ["VERTICAL_LINE_DRAWING"],
  "EV_SVG_MOUSEMOVE",
  (e: MouseEvent) =>
    verticalLineDrawer.setNewVerticalLine(e, linePosition.value),
);

watchHelper.watchMouseEvent(
  ["VERTICAL_LINE_EDITING_TOP"],
  "EV_SVG_MOUSEMOVE",
  (e: MouseEvent) =>
    verticalLineDrawer.setExistingVerticalLine(e, linePosition.value, true),
);

watchHelper.watchMouseEvent(
  ["VERTICAL_LINE_EDITING_BOTTOM"],
  "EV_SVG_MOUSEMOVE",
  (e: MouseEvent) =>
    verticalLineDrawer.setExistingVerticalLine(e, linePosition.value, false),
);

watchHelper.watchMouseEvent(
  [
    "VERTICAL_LINE_DRAWING",
    "VERTICAL_LINE_EDITING_BOTTOM",
    "VERTICAL_LINE_EDITING_TOP",
  ],
  "EV_SVG_MOUSEUP",
  () => verticalLineDrawer.endDrawingVerticalLine(linePosition.value),
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

// watchHelper.watchMouseEvent(["VERTICAL_LINE_EDITING"], "EV_SVG_MOUSEUP", () =>
//   lineDrawer.endLineEditing(),
// );
</script>
