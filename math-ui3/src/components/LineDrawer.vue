<template>
  <v-card v-show="editStarted">
    <v-card
      id="lineLeftHandle"
      class="lineHandle"
      v-bind:style="{
        left: lineLeft - 5 + 'px',
        top: lineTop + 'px',
      }"
      v-on:mousedown="leftHandleMouseDown"
      v-on:mouseup="mouseup"
    ></v-card>
    <v-card
      id="lineRightHandle"
      class="lineHandle"
      v-bind:style="{
        left: lineRight + 'px',
        top: lineTop + 'px',
      }"
      v-on:mousedown="rightHandleMouseDown"
      v-on:mouseup="mouseup"
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
      v-on:mouseup="mouseup"
    ></v-divider>
    <p
      style="left: -2px; position: relative; z-index: 99; border: solid 1px"
      v-if="notationType === 'SQRT'"
    >
      &#x221A;
    </p>
  </v-card>
</template>
<script setup lang="ts">
import useMatrixHelper from "../helpers/matrixHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import { watch, computed, ref } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { LinePosition, DotPosition } from "../../../math-common/src/globals";
import {
  LineAttributes,
  LineNotationAttributes,
} from "../../../math-common/build/baseTypes";
import useEventBus from "../helpers/eventBus";

const eventBus = useEventBus();
const matrixHelper = useMatrixHelper();
const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();

const props = defineProps({
  svgId: { type: String },
});

let editStarted = ref(false);
let notationType = ref("SYMBOL");
let linePosition = ref(<LinePosition | Record<string, never>>{});

let lineLeft = computed(() =>
  Math.min(linePosition.value.x1, linePosition.value.x2),
);
let lineRight = computed(() =>
  Math.max(linePosition.value.x1, linePosition.value.x2),
);
let lineTop = computed(() => linePosition.value.y);

watch(
  () => notationStore.getActiveCell(),
  (newActivecell) => {
    if (newActivecell) reset();
  },
);

watch(
  () => eventBus.bus.value.get("svgmouseup"),
  () => {
    handleMouseUp();
  },
);

watch(
  () => eventBus.bus.value.get("svgmousemove"),
  (e: MouseEvent) => {
    handleMouseMove(e);
  },
);

watch(
  () => eventBus.bus.value.get("svgmousedown"),
  (e: MouseEvent) => {
    handleMouseDown(e);
  },
);

/// TODO unregister upon destroy
// onMounted(() => {
//   registerSvgMouseDown();
//   registerSvgMouseMove();
//   registerSvgMouseUp();
// });

// function registerSvgMouseMove() {
//   document
//     ?.getElementById(props.svgId!)
//     ?.addEventListener("mousemove", handleSvgMouseMove);
// }

// function registerSvgMouseDown() {
//   document
//     ?.getElementById(props.svgId!)
//     ?.addEventListener("mousedown", handleMouseDown);
// }

// function registerSvgMouseUp() {
//   document
//     ?.getElementById(props.svgId!)
//     ?.addEventListener("mouseup", handleMouseUp);
// }

function leftHandleMouseDown() {
  editStarted.value = true;
}

function rightHandleMouseDown() {
  editStarted.value = true;
}

function handleMouseDown(e: MouseEvent) {
  if (e.buttons !== 1) {
    // ignore right button
    return;
  }

  if (editStarted.value === true) {
    return;
  }

  if (notationStore.isLineMode()) {
    // new line
    notationType.value =
      notationStore.getEditMode().value === "FRACTION" ? "FRACTION" : "SQRT";

    startLineDrawing({ x: e.offsetX, y: e.offsetY });
  }

  let fraction = findFractionLineAtClickedPosition(e);
  if (fraction) {
    //select existing fraction
    notationType.value = "FRACTION";
    selectLine(fraction.id);
    return;
  }

  let sqrt = findSqrtLineAtClickedPosition(e);
  if (sqrt) {
    //select existing sqrt
    notationType.value = "SQRT";
    selectLine(sqrt.id);
  }
}

function handleMouseMove(e: MouseEvent) {
  // not related to line drawing
  if (!notationStore.isLineMode()) {
    return;
  }

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
}

function mouseup(e: KeyboardEvent) {
  eventBus.emit("svgmouseup", e);
}

function handleMouseUp() {
  // not related to line drawing
  if (!notationStore.isLineMode()) {
    return;
  }

  // drawing not started
  if (linePosition.value.x1 === 0 && linePosition.value.x2 === 0) {
    return;
  }

  // during edit line
  if (editStarted) {
    return;
  }

  endDrawLine();
}

/// TODO move to global
function getNearestRow(clickedYPos: number) {
  let clickedRow = Math.round(clickedYPos / notationStore.getRectSize());
  return clickedRow * notationStore.getRectSize();
}

function startLineDrawing(position: DotPosition) {
  editStarted.value = true;
  linePosition.value.x2 = linePosition.value.x1 = position.x;
  linePosition.value.y = getNearestRow(position.y);
}

function selectLine(notationUUId: string) {
  let notation = notationStore
    .getNotations()
    .value.get(notationUUId) as LineNotationAttributes;

  linePosition.value.x1 = matrixHelper.getNotationXposByCol(notation.fromCol);

  linePosition.value.x2 =
    linePosition.value.x1 +
    (notation.toCol - notation.fromCol) * notationStore.getRectSize();

  linePosition.value.y = matrixHelper.getNotationYposByRow(notation.row);
  notationStore.setActiveNotation(notation);
}

function setLine(xPos: number) {
  if (xPos < linePosition.value.x1) {
    linePosition.value.x1 = xPos;
  }
  if (xPos > linePosition.value.x1) {
    linePosition.value.x2 = xPos;
  }
}

function saveLine(lineAttributes: LineAttributes) {
  if (notationType.value == "FRACTION")
    notationMutateHelper.addFractiontNotation(lineAttributes);
  else if (notationType.value == "SQRT")
    notationMutateHelper.addSqrtNotation(lineAttributes);
  else {
    throw notationType + ":is not a valid line type";
  }
}

function endDrawLine() {
  if (linePosition.value.x2 == linePosition.value.x1) return;
  let fromCol = Math.floor(linePosition.value.x1 / notationStore.getRectSize());

  let toCol = Math.ceil(linePosition.value.x2 / notationStore.getRectSize());

  let row = Math.round(linePosition.value.y / notationStore.getRectSize());

  let lineAttributes: LineAttributes = {
    fromCol: fromCol,
    toCol: toCol,
    row: row,
  };

  saveLine(lineAttributes);
  eventBus.emit("drawLineEnded"); // signal parent
  reset();
}

function reset() {
  linePosition.value.x1 = linePosition.value.x2 = linePosition.value.y = 0;
  editStarted.value = false;
}

function findFractionLineAtClickedPosition(e: MouseEvent) {
  return matrixHelper.findClickedObject(
    {
      x: e.clientX,
      y: e.clientY,
    },
    "foreignObject",
    "FRACTION",
  );
}

function findSqrtLineAtClickedPosition(e: MouseEvent) {
  return matrixHelper.findClickedObject(
    {
      x: e.clientX,
      y: e.clientY,
    },
    "foreignObject",
    "SQRT",
  );
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
