<template>
  <line-watcher
    :startEntry="{
      editMode: ['VERTICAL_LINE_STARTED'],
      func: setInitialLinePosition,
    }"
    :drawEntry="{
      editMode: ['VERTICAL_LINE_DRAWING'],
      func: drawVerticalLine,
    }"
    :editEntryFirstHandle="{
      editMode: ['VERTICAL_LINE_EDITING_TOP'],
      func: modifyTopVerticalLine,
    }"
    :editEntrySecondHandle="{
      editMode: ['VERTICAL_LINE_EDITING_BOTTOM'],
      func: modifyBottomVerticalLine,
    }"
    :endEntry="{
      editMode: ['VERTICAL_LINE_SELECTED'],
      func: endDrawing,
    }"
  />
  <div v-show="show">
    <line-handle
      drawing-mode="VERTICAL_LINE_DRAWING"
      editing-mode="VERTICAL_LINE_EDITING_TOP"
      v-bind:style="{
        left: handleX + 'px',
        top: handleTop + 'px',
      }"
    ></line-handle>
    <line-handle
      drawing-mode="VERTICAL_LINE_DRAWING"
      editing-mode="VERTICAL_LINE_EDITING_BOTTOM"
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
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useScreenHelper from "../helpers/screenHelper";
import useLineDrawer from "../helpers/lineDrawingHelper";
import lineWatcher from "./LineWatcher.vue";
import { useNotationStore } from "../store/pinia/notationStore";

import {
  VerticalLineNotationAttributes,
  VerticalLineAttributes,
  DotCoordinates,
} from "../../../math-common/src/baseTypes";
import lineHandle from "./LineHandle.vue";
import { LineHandleType } from "common/unions";

const watchHelper = useWatchHelper();
const lineDrawer = useLineDrawer();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();
const screenHelper = useScreenHelper();
const notationStore = useNotationStore();
const notationMutateHelper = useNotationMutateHelper();

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

// watchHelper.watchMouseEvent(
//   [
//     "VERTICAL_LINE_DRAWING",
//     "VERTICAL_LINE_EDITING_BOTTOM",
//     "VERTICAL_LINE_EDITING_TOP",
//     "VERTICAL_LINE_SELECTED",
//   ],
//   "EV_SVG_MOUSEUP",
//   () => verticalLineDrawer.endDrawingVerticalLine(linePosition.value),
// );

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

function setInitialLinePosition(p: DotCoordinates) {
  linePosition.value.px = p.x;
  linePosition.value.p1y = p.y;
  linePosition.value.p2y = p.y;
}

function setY(handleType: LineHandleType, yPos: number) {
  if (handleType === "top") {
    linePosition.value.p1y = yPos;
  } else {
    linePosition.value.p2y = yPos;
  }
}

function drawVerticalLine(p: DotCoordinates) {
  const handleType =
    Math.abs(p.y - linePosition.value.p1y) <
    Math.abs(linePosition.value.p2y - p.y)
      ? "top"
      : "bottom";

  setY(handleType, p.y);
}

function modifyTopVerticalLine(p: DotCoordinates) {
  setY("top", p.y);
}

function modifyBottomVerticalLine(p: DotCoordinates) {
  setY("bottom", p.y);
}

function fixLineEdge(linePosition: VerticalLineAttributes) {
  const nearLineRightEdge = screenHelper.getCloseLineEdge({
    x: linePosition.px,
    y: linePosition.p1y,
  });

  if (nearLineRightEdge != null) {
    linePosition.px = nearLineRightEdge.x;
    linePosition.p1y = nearLineRightEdge.y;
  }

  const nearLineLeftEdge = screenHelper.getCloseLineEdge({
    x: linePosition.px,
    y: linePosition.p2y,
  });

  if (nearLineLeftEdge != null) {
    linePosition.px = nearLineLeftEdge.x;
    linePosition.p2y = nearLineLeftEdge.y;
  }
}

function endDrawing() {
  saveVerticalLine();
  resetDrawing();
}

function saveVerticalLine() {
  fixLineEdge(linePosition.value);

  if (notationStore.getSelectedNotations().length > 0) {
    let updatedLine = {
      ...notationStore.getSelectedNotations().at(0)!,
      ...linePosition.value,
    };

    notationMutateHelper.updateVerticalLineNotation(
      updatedLine as VerticalLineNotationAttributes,
    );
  } else
    notationMutateHelper.addVerticalLineNotation(
      linePosition.value,
      "VERTICALLINE",
    );
}

function resetDrawing() {
  linePosition.value.px = linePosition.value.p1y = linePosition.value.p2y = 0;
  notationStore.resetSelectedNotations();
  editModeStore.setDefaultEditMode();
}
</script>
