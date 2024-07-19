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
        :x1="lineX"
        :y1="lineTop"
        :x2="lineX"
        :y2="lineBottom"
        class="line"
      />
    </svg>
  </div>
</template>
<script setup lang="ts">
import useNotationMutateHelper from "../helpers/notationMutateHelper";

import { watch, computed, ref } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { cellSpace } from "../../../math-common/src/globals";

import {
  VerticalLinePosition,
  DotCoordinates,
} from "../../../math-common/src/baseTypes";

import {
  VerticalLineAttributes,
  VerticalLineNotationAttributes,
} from "../../../math-common/src/baseTypes";
import useEventBus from "../helpers/eventBusHelper";

const eventBus = useEventBus();
const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();

// props

const props = defineProps({
  svgId: { type: String, default: "" },
});

// vars

let linePosition = ref(<VerticalLinePosition>{
  x: 0,
  y1: 0,
  y2: 0,
});

const show = computed(() => {
  return (
    editModeStore.isVerticalLineDrawingMode() ||
    editModeStore.isVerticalLineSelectedMode()
  );
});

function svgDimensions(): DOMRect | undefined {
  return document.getElementById(props.svgId)?.getBoundingClientRect();
}

let lineTop = computed(() => {
  return linePosition.value.y1;
});

let lineBottom = computed(() => {
  return linePosition.value.y2;
});

let lineX = computed(() => {
  return linePosition.value.x;
});

let handleX = computed(() => {
  return lineX.value + (svgDimensions()?.top ?? 0) + 5;
});

let handleTop = computed(() => {
  return lineTop.value + (svgDimensions()?.top ?? 0) - 5;
});

let handleBottom = computed(() => {
  return lineBottom.value + (svgDimensions()?.top ?? 0);
});

// watch

watch(
  () => eventBus.bus.value.get("SVG_MOUSEUP"),
  () => {
    onMouseUp();
  },
);

watch(
  () => eventBus.bus.value.get("SVG_MOUSEMOVE"),
  (e: MouseEvent) => {
    onMouseMove(e);
  },
);

watch(
  () => eventBus.bus.value.get("SVG_MOUSEDOWN"),
  (e: MouseEvent) => {
    onMouseDown(e);
  },
);

watch(
  () => eventBus.bus.value.get("VERTICAL_LINE_SELECTED"),
  (line: VerticalLineNotationAttributes) => {
    if (line) onLineSelected(line);
  },
);

// event handlers

function onLineSelected(lineNotation: VerticalLineNotationAttributes) {
  linePosition.value.x =
    lineNotation.col * (cellStore.getCellHorizontalWidth() + cellSpace);

  linePosition.value.y1 =
    lineNotation.fromRow * (cellStore.getCellVerticalHeight() + cellSpace);

  linePosition.value.y2 =
    lineNotation.toRow * (cellStore.getCellVerticalHeight() + cellSpace);

  notationStore.selectNotation(lineNotation.uuid);

  /// TODO use close list for emiiter
  eventBus.emit("VERTICAL_LINE_SELECTED", null); // to enable re selection
}

function onHandleMouseDown() {
  editModeStore.setNextEditMode();
}

// emitted by event manager
function onMouseDown(e: MouseEvent) {
  if (e.buttons !== 1) {
    // ignore right button
    return;
  }

  // user clicked elsewere after start drawing
  if (editModeStore.isVerticalLineDrawingMode()) {
    resetLineDrawing();
  }

  // new line
  if (editModeStore.isVerticalLineStartedMode()) {
    startLineDrawing({
      x: e.offsetX,
      y: e.offsetY,
    });
    editModeStore.setNextEditMode();
  }
}

function onMouseMove(e: MouseEvent) {
  // ignore right button
  if (e.buttons !== 1) {
    return;
  }

  // nothing done yet
  if (
    linePosition.value.x === 0 &&
    linePosition.value.y1 === 0 &&
    linePosition.value.y2 === 0
  ) {
    return;
  }

  if (!editModeStore.isVerticalLineDrawingMode()) {
    return;
  }

  setLine(e.offsetY);
}

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

// methods

function startLineDrawing(position: DotCoordinates) {
  linePosition.value.y1 = position.y;

  linePosition.value.y2 = linePosition.value.y1 + 10;

  linePosition.value.x = getNearestCol(position.x);
}

function setLine(yPos: number) {
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
    linePosition.value.x / (cellStore.getCellHorizontalWidth() + cellSpace),
  );

  let fromRow = Math.round(
    linePosition.value.y1 / (cellStore.getCellVerticalHeight() + cellSpace),
  );

  let toRow = Math.round(
    linePosition.value.y2 / (cellStore.getCellVerticalHeight() + cellSpace),
  );

  saveLine({ col: col, fromRow: fromRow, toRow: toRow });

  editModeStore.setDefaultEditMode();
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
  let clickedCol = Math.round(
    clickedXPos / (cellStore.getCellHorizontalWidth() + cellSpace),
  );
  return clickedCol * (cellStore.getCellHorizontalWidth() + cellSpace);
}
</script>

<style>
.line {
  top: 4px;
  position: absolute;
  color: black;
  display: block;
  border-bottom: solid 1px;
  border-top: solid 1px;
  z-index: 999;
}
.lineHandle {
  cursor: col-resize;
  display: block;
  position: absolute;
  z-index: 999;
  width: 12px;
  height: 12px;
  border: 1, 1, 1, 1;
}
</style>
