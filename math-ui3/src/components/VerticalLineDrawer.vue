<template>
  <div v-show="show">
    <v-card
      id="lineToptHandle"
      class="lineHandle"
      v-bind:style="{
        left: handleX + 'px',
        top: handleTop + 'px',
      }"
      v-on:mouseup="onMouseUp"
      v-on:mousedown="onHandleMouseDown"
    ></v-card>
    <v-card
      id="lineBottomHandle"
      class="lineHandle"
      v-bind:style="{
        left: handleX + 'px',
        top: handleBottom + 'px',
      }"
      v-on:mouseup="onMouseUp"
      v-on:mousedown="onHandleMouseDown"
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

import { VerticalLinePosition } from "../../../math-common/src/baseTypes";

import {
  VerticalLineAttributes,
  VerticalLineNotationAttributes,
} from "../../../math-common/src/baseTypes";

const notationMutateHelper = useNotationMutateHelper();
const watchHelper = useWatchHelper();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();

// vars

let linePosition = ref(<VerticalLinePosition>{
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

// let lineTop = computed(() => {
//   return linePosition.value.p1y;
// });

// let lineBottom = computed(() => {
//   return linePosition.value.p2y;
// });

// let lineX = computed(() => {
//   return linePosition.value.px;
// });

let handleX = computed(() => {
  return linePosition.value.px + (cellStore.getSvgBoundingRect().left ?? 0) - 5;
});

let handleTop = computed(() => {
  if (!cellStore.getSvgBoundingRect()) return;
  return linePosition.value.p2y + (cellStore.getSvgBoundingRect().top ?? 0) - 5;
});

let handleBottom = computed(() => {
  if (!cellStore.getSvgBoundingRect()) return;
  return linePosition.value.p1y + (cellStore.getSvgBoundingRect().top ?? 0);
});

// watchers

watchHelper.watchMouseEvent(
  ["VERTICAL_LINE_STARTED"],
  "EV_SVG_MOUSEDOWN",
  startDrawLine,
);

watchHelper.watchMouseEvent(
  ["VERTICAL_LINE_DRAWING"],
  "EV_SVG_MOUSEMOVE",
  setLine,
);

watchHelper.watchMouseEvent(
  ["VERTICAL_LINE_DRAWING"],
  "EV_SVG_MOUSEUP",
  endDrawLine,
);

// emmited by selection helper
watchHelper.watchNotationSelection(
  "VERTICAL_LINE_SELECTED",
  "EV_VERTICAL_LINE_SELECTED",
  lineSelected,
);

watchHelper.watchMouseEvent(
  ["VERTICAL_LINE_SELECTED"],
  "EV_SVG_MOUSEDOWN",
  resetLineDrawing,
);

watchHelper.watchMouseEvent(["VERTICAL_LINE_SELECTED"], "EV_SVG_MOUSEUP", () =>
  editModeStore.setDefaultEditMode(),
);

// methods

function lineSelected(lineNotation: VerticalLineNotationAttributes) {
  Object.assign(linePosition.value, lineNotation);
  notationStore.selectNotation(lineNotation.uuid);
}

function onHandleMouseDown() {
  editModeStore.setNextEditMode();
}

// emitted by event manager

function onMouseUp() {
  // drawing not started
  if (
    linePosition.value.px === 0 &&
    linePosition.value.p1y === 0 &&
    linePosition.value.p2y === 0
  ) {
    return;
  }

  // line yet not modified
  if (editModeStore.isVerticalLineDrawingMode()) {
    endDrawLine();
  }
}

function startDrawLine(e: MouseEvent) {
  editModeStore.setNextEditMode();

  if (linePosition.value.p1y) return;

  const position = {
    x: e.pageX - cellStore.getSvgBoundingRect().x,
    y: e.pageY - cellStore.getSvgBoundingRect().y,
  };

  linePosition.value.p1y = position.y;
  linePosition.value.p2y = linePosition.value.p1y + 10;
  linePosition.value.px = getNearestCol(position.y);
}

function setLine(e: MouseEvent) {
  const yPos = e.pageY - (cellStore.getSvgBoundingRect()?.y ?? 0);

  const modifyTop =
    Math.abs(yPos - linePosition.value.p1y) <
    Math.abs(linePosition.value.p2y - yPos);

  if (modifyTop) {
    linePosition.value.p1y = yPos;
  } else {
    linePosition.value.p2y = yPos;
  }
}

function endDrawLine() {
  if (linePosition.value.p2y == linePosition.value.p1y) return;

  let col = Math.round(
    linePosition.value.px / cellStore.getCellHorizontalWidth(),
  );

  let fromRow = Math.round(
    linePosition.value.p1y / cellStore.getCellVerticalHeight(),
  );

  let toRow = Math.round(
    linePosition.value.p2y / cellStore.getCellVerticalHeight(),
  );

  saveLine(linePosition.value);

  resetLineDrawing();
}

function saveLine(lineAttributes: VerticalLineAttributes) {
  if (notationStore.getSelectedNotations().length > 0) {
    let updatedLine = {
      ...notationStore.getSelectedNotations().at(0)!,
      ...lineAttributes,
    };

    notationMutateHelper.updateVerticalLineNotation(
      updatedLine as VerticalLineNotationAttributes,
    );
  } else
    notationMutateHelper.addVerticalLineNotation(
      lineAttributes,
      editModeStore.getNotationTypeByEditMode(),
    );
}

function resetLineDrawing() {
  linePosition.value.px = linePosition.value.p1y = linePosition.value.p2y = 0;
  editModeStore.setDefaultEditMode();
}

function getNearestCol(clickedXPos: number) {
  let clickedCol = Math.round(clickedXPos / cellStore.getCellHorizontalWidth());
  return clickedCol * cellStore.getCellHorizontalWidth();
}
</script>
