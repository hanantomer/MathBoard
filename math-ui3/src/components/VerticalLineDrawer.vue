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
        :x1="linePosition.x"
        :y1="linePosition.x"
        :x2="linePosition.y1"
        :y2="linePosition.y2"
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
  x: 0,
  y1: 0,
  y2: 0,
});

// computed

const show = computed(() => {
  return (
    editModeStore.isVerticalLineDrawingMode() ||
    editModeStore.isVerticalLineSelectedMode()
  );
});

// let lineTop = computed(() => {
//   return linePosition.value.y1;
// });

// let lineBottom = computed(() => {
//   return linePosition.value.y2;
// });

// let lineX = computed(() => {
//   return linePosition.value.x;
// });

let handleX = computed(() => {
  return linePosition.value.x + (cellStore.getSvgBoundingRect().left ?? 0) - 5;
});

let handleTop = computed(() => {
  if (!cellStore.getSvgBoundingRect()) return;
  return linePosition.value.y2 + (cellStore.getSvgBoundingRect().top ?? 0) - 5;
});

let handleBottom = computed(() => {
  if (!cellStore.getSvgBoundingRect()) return;
  return linePosition.value.y1 + (cellStore.getSvgBoundingRect().top ?? 0);
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
    linePosition.value.x === 0 &&
    linePosition.value.y1 === 0 &&
    linePosition.value.y2 === 0
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

  if (linePosition.value.y1) return;

  const position = {
    x: e.pageX - cellStore.getSvgBoundingRect().x,
    y: e.pageY - cellStore.getSvgBoundingRect().y,
  };

  linePosition.value.y1 = position.y;
  linePosition.value.y2 = linePosition.value.y1 + 10;
  linePosition.value.x = getNearestCol(position.x);
}

function setLine(e: MouseEvent) {
  const yPos = e.pageY - (cellStore.getSvgBoundingRect()?.y ?? 0);

  const modifyTop =
    Math.abs(yPos - linePosition.value.y1) <
    Math.abs(linePosition.value.y2 - yPos);

  if (modifyTop) {
    linePosition.value.y1 = yPos;
  } else {
    linePosition.value.y2 = yPos;
  }
}

function endDrawLine() {
  if (linePosition.value.y2 == linePosition.value.y1) return;

  let col = Math.round(
    linePosition.value.x / cellStore.getCellHorizontalWidth(),
  );

  let fromRow = Math.round(
    linePosition.value.y1 / cellStore.getCellVerticalHeight(),
  );

  let toRow = Math.round(
    linePosition.value.y2 / cellStore.getCellVerticalHeight(),
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
  linePosition.value.x = linePosition.value.y1 = linePosition.value.y2 = 0;
  editModeStore.setDefaultEditMode();
}

function getNearestCol(clickedXPos: number) {
  let clickedCol = Math.round(clickedXPos / cellStore.getCellHorizontalWidth());
  return clickedCol * cellStore.getCellHorizontalWidth();
}
</script>
