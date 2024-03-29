<template>
  <div v-show="show">
    <v-card
      id="lineLeftHandle"
      class="lineHandle"
      v-bind:style="{
        left: lineLeft - 5 + 'px',
        top: lineTop + 'px',
      }"
      v-on:mouseup="mouseup"
      v-on:mousedown="onHandleMouseDown"
    ></v-card>
    <v-card
      id="lineRightHandle"
      class="lineHandle"
      v-bind:style="{
        left: lineRight + 'px',
        top: lineTop + 'px',
      }"
      v-on:mouseup="mouseup"
      v-on:mousedown="onHandleMouseDown"
    ></v-card>
    <v-card
      id="line"
      class="line"
      v-bind:style="{
        color: 'black',
        left: lineLeft + 8 + 'px',
        top: lineTop + 'px',
        width: lineRight - lineLeft + 'px',
        height: '1px',
      }"
      v-on:mouseup="mouseup"
    ></v-card>
    <p
      style="position: absolute"
      class="sqrtsymbol"
      v-bind:style="{
        left: lineLeft - 11 + 'px',
        top: lineTop + 'px',
      }"
      v-if="sqrtEditMode"
    >
      &#x221A;
    </p>
  </div>
</template>
<script setup lang="ts">
import useNotationMutateHelper from "../helpers/notationMutateHelper";

import { watch, computed, ref } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import {
  LinePosition,
  DotPosition,
  cellSpace,
} from "../../../math-common/src/globals";
import {
  LineAttributes,
  LineNotationAttributes,
} from "../../../math-common/src/baseTypes";
import useEventBus from "../helpers/eventBusHelper";

const eventBus = useEventBus();
const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();

// props

const props = defineProps({
  svgId: { type: String, default: "" },
});

// vars

let selectedLine: LineNotationAttributes | null = null;
let linePosition = ref(<LinePosition | Record<string, never>>{});

const sqrtEditMode = computed(() => {
  return editModeStore.isSqrtEditMode();
});

const show = computed(() => {
  return (
    editModeStore.isLineDrawingMode() || editModeStore.isLineSelectedMode()
  );
});

const svgDimensions = computed(() => {
  return document.getElementById(props.svgId)?.getBoundingClientRect()!;
});

let lineLeft = computed(() => {
  return Math.min(linePosition.value.x1, linePosition.value.x2);
});

let lineRight = computed(() => {
  return Math.max(linePosition.value.x1, linePosition.value.x2);
});

let lineTop = computed(() => {
  return linePosition.value.y;
});

// watch

watch(
  () => eventBus.bus.value.get("svgmouseup"),
  () => {
    onMouseUp();
  },
);

watch(
  () => eventBus.bus.value.get("svgmousemove"),
  (e: MouseEvent) => {
    onMouseMove(e);
  },
);

watch(
  () => eventBus.bus.value.get("svgmousedown"),
  (e: MouseEvent) => {
    onMouseDown(e);
  },
);

watch(
  () => eventBus.bus.value.get("lineSelected"),
  (line: LineNotationAttributes) => {
    if (line) onLineSelected(line);
  },
  { immediate: true },
);

// event emitters

function mouseup(e: KeyboardEvent) {
  eventBus.emit("svgmouseup", e);
}

// event handlers

function onLineSelected(lineNotation: LineNotationAttributes) {
  linePosition.value.x1 =
    svgDimensions.value.left +
    lineNotation.fromCol * (notationStore.getCellHorizontalWidth() + cellSpace);

  linePosition.value.x2 =
    svgDimensions.value.left +
    (lineNotation.toCol - 1) *
      (notationStore.getCellHorizontalWidth() + cellSpace);

  linePosition.value.y =
    svgDimensions.value.top +
    lineNotation.row * (notationStore.getCellVerticalHeight() + cellSpace);

  notationStore.selectNotation(lineNotation.uuid);

  eventBus.emit("lineSelected", null); // to enable re selection
}

function onHandleMouseDown() {
  editModeStore.setNextEditMode();
}

// emitted by event manager
function onMouseDown(e: MouseEvent) {
  console.debug(e);
  if (e.buttons !== 1) {
    // ignore right button
    return;
  }

  // user clicked elsewere after start drawing
  if (editModeStore.isLineDrawingMode()) {
    resetLineDrawing();
  }

  // new line
  if (
    editModeStore.getEditMode() === "FRACTION" ||
    editModeStore.getEditMode() === "SQRT"
  ) {
    startLineDrawing({
      x: e.offsetX,
      y: e.offsetY,
    });
    editModeStore.setNextEditMode();
  }
}

function onMouseMove(e: MouseEvent) {
  console.debug("onMouseMove: buttons = " + e.buttons);

  // ignore right button
  if (e.buttons !== 1) {
    return;
  }

  console.debug(linePosition);
  // nothing done yet
  if (linePosition.value.x1 === 0 && linePosition.value.x2 === 0) {
    return;
  }

  console.debug(editModeStore.isLineDrawingMode());
  if (!editModeStore.isLineDrawingMode()) {
    return;
  }

  console.debug("e.clientX:" + e.clientX);
  setLineWidth(e.clientX);
}

function onMouseUp() {
  // drawing not started
  if (linePosition.value.x1 === 0 && linePosition.value.x2 === 0) {
    return;
  }

  // line yet not modified
  if (editModeStore.isLineDrawingMode()) {
    endDrawLine();
  }
}

// methods

function startLineDrawing(position: DotPosition) {
  console.debug(svgDimensions.value);
  linePosition.value.x1 = position.x + svgDimensions.value.left;

  linePosition.value.x2 = linePosition.value.x1 + 10;

  linePosition.value.y = getNearestRow(position.y) + svgDimensions.value.top;
}

function setLineWidth(xPos: number) {
  if (xPos <= linePosition.value.x1) {
    linePosition.value.x1 = xPos;
  }
  if (xPos > linePosition.value.x1) {
    linePosition.value.x2 = xPos;
  }
}

function endDrawLine() {
  if (linePosition.value.x2 == linePosition.value.x1) return;

  let fromCol = Math.round(
    (linePosition.value.x1 - svgDimensions.value.left) /
      (notationStore.getCellHorizontalWidth() + cellSpace),
  );

  let toCol = Math.round(
    (linePosition.value.x2 - svgDimensions.value.left) /
      (notationStore.getCellHorizontalWidth() + cellSpace),
  );

  let row = Math.round(
    (linePosition.value.y - svgDimensions.value.top) /
      (notationStore.getCellVerticalHeight() + cellSpace),
  );

  let lineAttributes: LineAttributes = {
    fromCol: fromCol,
    toCol: toCol,
    row: row,
  };

  saveLine(lineAttributes);
  editModeStore.resetEditMode();
}

function saveLine(lineAttributes: LineAttributes) {
  if (selectedLine) notationMutateHelper.updateLineNotation(selectedLine);
  else
    notationMutateHelper.addLineNotation(
      lineAttributes,
      editModeStore.isFractionMode() ? "FRACTION" : "SQRT",
    );
}

function resetLineDrawing() {
  linePosition.value.x1 = linePosition.value.x2 = linePosition.value.y = 0;
  editModeStore.resetEditMode();
}

function getNearestRow(clickedYPos: number) {
  let clickedRow = Math.round(
    clickedYPos / (notationStore.getCellVerticalHeight() + cellSpace),
  );
  return clickedRow * (notationStore.getCellVerticalHeight() + cellSpace);
}
</script>

<style>
foreignObject[type="fraction"],
foreignObject[type="sqrt"] {
  height: 10px;
  padding-top: 4px;
  cursor: pointer;
}
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

.sqrtsymbol {
  margin-left: 6px;
  z-index: 999;
  font-weight: bold;
  font-size: 1.8em;
}
</style>
