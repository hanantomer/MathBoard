<template>
  <div v-show="show">
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
      style="color: darkred; z-index: 9999"
      id="line"
      class="line"
      v-bind:style="{
        left: lineLeft + 'px',
        top: lineTop + 'px',
        width: lineRight - lineLeft + 'px',
        height: '5px',
      }"
      v-on:mouseup="mouseup"
    ></v-divider>
    <p
      style="left: -2px; position: relative; z-index: 99; border: solid 1px"
      v-if="notationType === 'SQRT'"
    >
      &#x221A;
    </p>
  </div>
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
import { NotationType } from "common/unions";

const eventBus = useEventBus();
const matrixHelper = useMatrixHelper();
const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();

// props

const props = defineProps({
  svgId: { type: String, default: "" },
});

// vars

let selectedLine: LineNotationAttributes | null = null;
let linePosition = ref(<LinePosition | Record<string, never>>{});

// computed

//let notationType: NotationType = "SYMBOL";

const notationType = computed(() => {
  return notationStore.getEditMode().value == "FRACTION" ||
    notationStore.getEditMode().value == "FRACTION_DRAWING" ||
    notationStore.getEditMode().value == "FRACTION_SELECTING"
    ? "FRACTION"
    : "SQRT";
});

const show = computed(() => {
  return notationStore.getEditMode().value == "FRACTION_DRAWING";
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

//watch(
//  () => notationStore.getActiveCell(),
//  (newActivecell) => {
//    if (newActivecell) resetLineDrawing();
//  },
//);

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

watch(
  () => eventBus.bus.value.get("lineSelected"),
  (line: LineNotationAttributes) => {
    handleSelectedLine(line);
  },
);

// event emitters

function mouseup(e: KeyboardEvent) {
  eventBus.emit("svgmouseup", e);
}

// event handlers

function handleSelectedLine(line: LineNotationAttributes) {
  //if (drawStarted.value) {
  //    return;
  // }

  notationStore.setEditMode(
    notationType.value == "FRACTION" ? "FRACTION" : "SQRT",
  );

  selectedLine = line; // store for later save

  startLineEditing(line);
}

function leftHandleMouseDown() {
  notationStore.setEditMode(
    notationType.value == "FRACTION" ? "FRACTION_DRAWING" : "SQRT_DRAWING",
  );
}

function rightHandleMouseDown() {
  notationStore.setEditMode("FRACTION_DRAWING");
}

// emitted by event manager
function handleMouseDown(e: MouseEvent) {
  if (e.buttons !== 1) {
    // ignore right button
    return;
  }

  // user clicked elsewere after start drawing
  if (
    notationStore.isLineDrawingMode() ||
    notationStore.isLineEditingMode() ||
    notationStore.isLineSelectionMode()
  ) {
    resetLineDrawing();
  }

  if (notationStore.isLineMode()) {
    // new line
    //    notationType.value =
    //      notationStore.getEditMode().value === "FRACTION" ? "FRACTION" : "SQRT";

    startLineDrawing({
      x: e.offsetX,
      y: e.offsetY,
    });
  }

  let fraction = findFractionLineAtClickedPosition(e);
  if (fraction) {
    //select existing fraction
    //notationType = "FRACTION";
    selectLine(fraction.id);
    return;
  }

  let sqrt = findSqrtLineAtClickedPosition(e);
  if (sqrt) {
    //select existing sqrt
    //notationType = "SQRT";
    selectLine(sqrt.id);
  }
}

function handleMouseMove(e: MouseEvent) {
  // ignore right button
  if (e.buttons !== 1) {
    return;
  }

  // nothing done
  if (linePosition.value.x1 === 0 && linePosition.value.x2 === 0) {
    return;
  }

  if (
    !notationStore.isLineMode() &&
    !notationStore.isLineDrawingMode() &&
    !notationStore.isLineEditingMode()
  ) {
    return;
  }

  setLineWidth(e.offsetX);
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

  // line yet not modified
  if (
    !notationStore.isLineDrawingMode() &&
    !notationStore.isLineEditingMode()
  ) {
    return;
  }

  endDrawLine();
}

// methods

function startLineDrawing(position: DotPosition) {
  notationStore.setEditMode(
    notationType.value === "FRACTION" ? "FRACTION_DRAWING" : "SQRT_DRAWING",
  );

  linePosition.value.x2 = linePosition.value.x1 =
    position.x + svgDimensions.value.left;
  linePosition.value.y = getNearestRow(position.y) + svgDimensions.value.top;
}

// called after line selection
function startLineEditing(line: LineAttributes) {
  notationStore.setEditMode(
    notationType.value === "FRACTION" ? "FRACTION_EDITITING" : "SQRT_EDITITING",
  );

  linePosition.value.x1 =
    svgDimensions.value.left + line.fromCol * notationStore.getRectSize();
  linePosition.value.x2 =
    svgDimensions.value.left + line.toCol * notationStore.getRectSize();
  linePosition.value.y =
    svgDimensions.value.top + line.row * notationStore.getRectSize();
}

function selectLine(notationUUId: string) {
  notationStore.setEditMode(
    notationType.value === "FRACTION" ? "FRACTION_SELECTING" : "SQRT_SELECTING",
  );

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

  if (selectedLine) selectedLine = { ...selectedLine, ...lineAttributes };

  saveLine(lineAttributes);
  notationStore.resetEditMode();
  if (selectedLine) {
    notationStore.getHiddenLineElement()!.style.display = "block";
  }
}

function saveLine(lineAttributes: LineAttributes) {
  if (selectedLine) notationMutateHelper.updateLineNotation(selectedLine);
  else notationMutateHelper.addLineNotation(lineAttributes, notationType.value);
}

function resetLineDrawing() {
  linePosition.value.x1 = linePosition.value.x2 = linePosition.value.y = 0;
  notationStore.setEditMode(notationStore.getDefaultEditMode());
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
</style>
