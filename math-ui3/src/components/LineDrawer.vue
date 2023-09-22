<template>
  <div>
    <v-card
      id="lineLeftHandle"
      class="lineHandle"
      v-bind:style="{
        left: lineLeft - 5 + 'px',
        top: lineTop + 'px',
      }"
      v-on:mousedown="leftHandleMouseDown"
      v-on:mouseup="handleMouseUp"
    ></v-card>
    <v-card
      id="lineRightHandle"
      class="lineHandle"
      v-bind:style="{
        left: lineRight + 'px',
        top: lineTop + 'px',
      }"
      v-on:mousedown="rightHandleMouseDown"
      v-on:mouseup="handleMouseUp"
    ></v-card>
    <v-divider
      style="color: red; z-index: 9999; height: 10px"
      id="line"
      class="line"
      v-bind:style="{
        left: lineLeft + 'px',
        top: lineTop + 'px',
        width: lineRight - lineLeft + 'px',
      }"
      v-on:mouseup="handleMouseUp"
    ></v-divider>
    <p
      style="left: -2px; position: relative; z-index: 99; border: solid 1px"
      v-if="notationType === NotationType.SQRT"
    >
      &#x221A;
    </p>
  </div>
</template>
<script setup lang="ts">

import useMatrixHelper from "../helpers/matrixHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import { watch, onMounted, computed, ref } from "vue"
import { useNotationStore } from "../store/pinia/notationStore";
import { EditMode, NotationType } from "../../../math-common/src/enum";
import { LinePosition, DotPosition  } from "../../../math-common/src/globals";
import { LineAttributes, LineNotationAttributes } from "../../../math-common/build/baseTypes";
import useEventBus from "../helpers/eventBus";

const eventBus = useEventBus();
const matrixHelper = useMatrixHelper();
const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();


const props = defineProps({
  svgId: { type: String }
});

let editStarted = ref(false);
let notationType = ref(NotationType.SYMBOL);
let linePosition  = ref(<LinePosition | Record<string, never>>{});

let lineLeft = computed(() => Math.min(linePosition.value.x1, linePosition.value.x2));
let lineRight = computed(() => Math.max(linePosition.value.x1, linePosition.value.x2));
let lineTop = computed(() => linePosition.value.y);

watch(() => notationStore.getActiveCell(), (newActivecell) => {
  if (newActivecell) reset();
});


/// TODO unregister upon destroy
onMounted(() => {
  registerSvgMouseDown();
  registerSvgMouseMove();
  registerSvgMouseUp();
});

function registerSvgMouseMove() {
  document?.getElementById(props.svgId!)?.addEventListener("mousemove", handleSvgMouseMove);
};

function registerSvgMouseDown() {
  document?.getElementById(props.svgId!)?.addEventListener("mousedown", handleMouseDown);
};

function registerSvgMouseUp() {
  document?.getElementById(props.svgId!)?.addEventListener("mouseup", handleMouseUp);
};

function leftHandleMouseDown() {
  editStarted.value = true;
};

function rightHandleMouseDown() {
  editStarted.value = true;
};

function handleMouseDown(e: MouseEvent) {
  if (e.buttons !== 1) {
    // ignore right button
    return;
  }

  if (editStarted) {
    return;
  }

  if (
    notationStore.getEditMode().value === EditMode.FRACTION ||
    notationStore.getEditMode().value === EditMode.SQRT
  ) {
    // new line
    notationType.value =
      notationStore.getEditMode().value === EditMode.FRACTION
        ? NotationType.FRACTION
        : NotationType.SQRT;

    startLineDrawing({ x: e.offsetX, y: e.offsetY });
  }

  let fraction = findFractionLineAtClickedPosition(e);
  if (fraction) {
    //select existing fraction
    notationType.value = NotationType.FRACTION;
    selectLine(fraction.id);
    return;
  }

  let sqrt = findSqrtLineAtClickedPosition(e);
  if (sqrt) {
    //select existing sqrt
    notationType.value = NotationType.SQRT;
    selectLine(sqrt.id);
  }
};

function handleSvgMouseMove(e: MouseEvent) {
  // left button is pressed
  if (e.buttons !== 1) {
    return;
  }

  if (linePosition.value.x1 === 0 && linePosition.value.x2 === 0) {
    return;
  }

  if (!editStarted) {
    return;
  }

  setLine(e.offsetX);
};

function handleMouseUp() {
  if (linePosition.value.x1 === 0 && linePosition.value.x2 === 0) {
    return;
  }
  if (editStarted) {
    return;
  }

  endDrawLine();
};

/// TODO move to global
function getNearestRow (clickedYPos: number) {
  let clickedRow = Math.round(clickedYPos /  matrixHelper.rectSize);
  return clickedRow * matrixHelper.rectSize;
};

function startLineDrawing (position: DotPosition) {
  editStarted.value = true;
  linePosition.value.x2 = linePosition.value.x1 = position.x;
  linePosition.value.y = getNearestRow(position.y);
};

function selectLine (notationUUId: string) {

      let notation = notationStore.getNotations().get(notationUUId) as LineNotationAttributes;

      linePosition.value.x1 = matrixHelper.getNotationXposByCol(notation.fromCol);

      linePosition.value.x2 =
        linePosition.value.x1 +
        (notation.toCol - notation.fromCol) * matrixHelper.rectSize;

      linePosition.value.y = matrixHelper.getNotationYposByRow(notation.row);
      notationMutateHelper.setActiveNotation(notation);
};

function setLine (xPos: number) {
  if (xPos < linePosition.value.x1) {
    linePosition.value.x1 = xPos;
  }
  if (xPos > linePosition.value.x1) {
    linePosition.value.x2 = xPos;
  }
};

function saveLine(lineAttributes: LineAttributes) {

  if (notationType.value == NotationType.FRACTION)
    notationMutateHelper.addFractiontNotation(lineAttributes);
  else if (notationType.value == NotationType.SQRT)
    notationMutateHelper.addSqrtNotation(lineAttributes);
  else {
    throw (notationType + ":is not a valid line type")
  }
};

function endDrawLine() {
  if (linePosition.value.x2 == linePosition.value.x1) return
  let fromCol = Math.floor(
    linePosition.value.x1 / matrixHelper.rectSize
  );

  let toCol = Math.ceil(
    linePosition.value.x2 / matrixHelper.rectSize
  );

  let row = Math.round(
    linePosition.value.y / matrixHelper.rectSize
  );

  let lineAttributes: LineAttributes  = { fromCol: fromCol, toCol: toCol, row: row  };

  saveLine(lineAttributes);
  eventBus.emit("drawLineEnded"); // signal parent
  reset();
};

function reset() {
  linePosition.value.x1 = linePosition.value.x2 = linePosition.value.y = 0;
  editStarted.value = false;
};

function findFractionLineAtClickedPosition(e: MouseEvent) {
  return matrixHelper.findClickedObject(
    {
      x: e.clientX,
      y: e.clientY,
    },
    "foreignObject",
    NotationType.FRACTION
  );
};

function findSqrtLineAtClickedPosition(e: MouseEvent) {
  return matrixHelper.findClickedObject(
    {
      x: e.clientX,
      y: e.clientY,
    },
    "foreignObject",
    NotationType.SQRT
  );
};


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
  display: block;
  border-bottom: solid 1px;
  border-top: solid 1px;
}
.lineHandle {
  cursor: col-resize;
  display: block;
  position: absolute;
  z-index: 999;
  width: 6px;
  height: 6px;
  border: 1, 1, 1, 1;
}
</style>
