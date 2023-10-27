<template>
  <div v-show="show">
    <v-card
      v-if="fractionMode"
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

import useStateMachine from "../helpers/stateMachine";
import { watch, computed, ref } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { LinePosition, DotPosition } from "../../../math-common/src/globals";
import {
  LineAttributes,
  LineNotationAttributes,
} from "../../../math-common/src/baseTypes";
import useEventBus from "../helpers/eventBus";

const eventBus = useEventBus();
const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();
const stateMachine = useStateMachine();

// props

const props = defineProps({
  svgId: { type: String, default: "" },
});

// vars

let selectedLine: LineNotationAttributes | null = null;
let linePosition = ref(<LinePosition | Record<string, never>>{});

// computed

const fractionMode = computed(() => {
  return notationStore.isFractionMode();
});

const sqrtEditMode = computed(() => {
  return notationStore.isSqrtEditMode();
});

const show = computed(() => {
  return (
    notationStore.isLineDrawingMode() ||
    notationStore.isLineEditingMode() ||
    notationStore.isLineSelectedMode() ||
    notationStore.isLineSelectingMode()
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
    if (line) onSelectedLine(line);
  },
  { immediate: true },
);

// event emitters

function mouseup(e: KeyboardEvent) {
  eventBus.emit("svgmouseup", e);
}

// event handlers

function onSelectedLine(line: LineNotationAttributes) {
  selectLine(line);
}

function onHandleMouseDown(e: MouseEvent) {
  stateMachine.setNextEditMode();
}

// emitted by event manager
function onMouseDown(e: MouseEvent) {
  if (e.buttons !== 1) {
    // ignore right button
    return;
  }

  // user clicked elsewere after start drawing
  if (notationStore.isLineDrawingMode() || notationStore.isLineEditingMode()) {
    resetLineDrawing();
  }

  if (notationStore.isLineMode()) {
    // new line
    startLineDrawing({
      x: e.offsetX,
      y: e.offsetY,
    });
  }
}

function onMouseMove(e: MouseEvent) {
  // ignore right button
  if (e.buttons !== 1) {
    return;
  }

  // nothing done
  if (linePosition.value.x1 === 0 && linePosition.value.x2 === 0) {
    return;
  }

  if (
    //!notationStore.isLineMode() &&
    !notationStore.isLineDrawingMode() &&
    !notationStore.isLineEditingMode() //&&
    //!notationStore.isLineSelectedMode()
  ) {
    return;
  }

  setLineWidth(e.offsetX);
}

function onMouseUp() {
  // drawing not started
  if (linePosition.value.x1 === 0 && linePosition.value.x2 === 0) {
    return;
  }

  // line yet not modified
  if (notationStore.isLineDrawingMode() || notationStore.isLineEditingMode()) {
    endDrawLine();
  }
}

// methods

function startLineDrawing(position: DotPosition) {
  stateMachine.setNextEditMode();

  linePosition.value.x2 = linePosition.value.x1 =
    position.x + svgDimensions.value.left;
  linePosition.value.y = getNearestRow(position.y) + svgDimensions.value.top;
}

function selectLine(lineNotation: LineNotationAttributes) {
  //selectedLine = lineNotation; // store for later save

  stateMachine.setNextEditMode();

  linePosition.value.x1 =
    svgDimensions.value.left +
    lineNotation.fromCol * notationStore.getRectSize();

  linePosition.value.x2 =
    svgDimensions.value.left + lineNotation.toCol * notationStore.getRectSize();

  linePosition.value.y =
    svgDimensions.value.top + lineNotation.row * notationStore.getRectSize();

  notationStore.setActiveNotation(lineNotation);

  eventBus.emit("lineSelected", null); // to enable re selection
}

function setLineWidth(xPos: number) {
  xPos += svgDimensions.value.left;

  if (xPos < linePosition.value.x1) {
    linePosition.value.x1 = xPos;
  }
  if (xPos > linePosition.value.x1) {
    linePosition.value.x2 = xPos;
  }
}

function endDrawLine() {
  if (linePosition.value.x2 == linePosition.value.x1) return;

  let fromCol = Math.ceil(
    (linePosition.value.x1 - svgDimensions.value.left) /
      notationStore.getRectSize(),
  );

  let toCol = Math.ceil(
    (linePosition.value.x2 - svgDimensions.value.left) /
      notationStore.getRectSize() -
      1,
  );

  let row = Math.round(
    (linePosition.value.y - svgDimensions.value.top) /
      notationStore.getRectSize(),
  );

  let lineAttributes: LineAttributes = {
    fromCol: fromCol,
    toCol: toCol,
    row: row,
  };

  //if (selectedLine) selectedLine = { ...selectedLine, ...lineAttributes };

  saveLine(lineAttributes);
  notationStore.resetEditMode();
  // if (selectedLine) {
  //   notationStore.getHiddenLineElement()!.style.display = "block";
  //   selectedLine = null;
  // }
}

function saveLine(lineAttributes: LineAttributes) {
  if (selectedLine) notationMutateHelper.updateLineNotation(selectedLine);
  else
    notationMutateHelper.addLineNotation(
      lineAttributes,
      notationStore.isFractionMode() ? "FRACTION" : "SQRT",
    );
}

function resetLineDrawing() {
  linePosition.value.x1 = linePosition.value.x2 = linePosition.value.y = 0;
  notationStore.setEditMode(notationStore.getDefaultEditMode());
}

function getNearestRow(clickedYPos: number) {
  let clickedRow = Math.round(clickedYPos / notationStore.getRectSize());
  return clickedRow * notationStore.getRectSize();
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
  position: absolute;
  color: black;
  display: block;
  border-bottom: solid 1px;
  border-top: solid 1px;
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
  margin-left: 10px;
  z-index: 999;
  font-weight: bold;
  font-size: 1.4em;
}
</style>
