<template>
  <div v-show="show">
    <v-card
      id="lineLeftHandle"
      class="lineHandle"
      v-bind:style="{
        left: lineLeft - 5 + 'px',
        top: lineTop + 'px',
      }"
      v-on:mouseup="onMouseUp"
      v-on:mousedown="onHandleMouseDown"
    ></v-card>
    <v-card
      id="lineRightHandle"
      class="lineHandle"
      v-bind:style="{
        left: lineRight + 'px',
        top: lineTop + 'px',
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
        :x1="lineLeft"
        :y1="lineTop"
        :x2="lineRight"
        :y2="lineBottom"
        style="stroke: red; stroke-width: 2"
      />
    </svg>
  </div>
</template>
<script setup lang="ts">
import useNotationMutateHelper from "../helpers/notationMutateHelper";

import { watch, computed, ref } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import {
  SlopeLinePosition,
  cellSpace,
  DotPosition
} from "../../../math-common/src/globals";
import {
  SlopeLineAttributes,
  SlopeLineNotationAttributes,
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

let linePosition = ref(<SlopeLinePosition>{
  left: { x: 0, y: 0 },
  right: { x: 0, y: 0 },
});


const show = computed(() => {
  return (
    editModeStore.isSlopeLineDrawingMode() || editModeStore.isSlopeLineSelectedMode()
  );
});

const svgDimensions = computed(() => {
  return document.getElementById(props.svgId)?.getBoundingClientRect()!;
});

let lineLeft = computed(() => {
  return linePosition.value.left.x;
});

let lineRight = computed(() => {
  return linePosition.value.right.y;
});

let lineBottom = computed(() => {
  return Math.max(linePosition.value.left.y, linePosition.value.right.y);
});

let lineTop = computed(() => {
  return Math.min(linePosition.value.left.y, linePosition.value.right.y);
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
  () => eventBus.bus.value.get("slopeLineSelected"), /// TODO: update emitter to distinguish line types
  (line: SlopeLineNotationAttributes) => {
    if (line) onSlopeLineSelected(line);
  },
  { immediate: true },
);

// event handlers


function onSlopeLineSelected(lineNotation: SlopeLineNotationAttributes) {
  linePosition.value.left.x =
    svgDimensions.value.left +
    lineNotation.fromCol * (notationStore.getCellHorizontalWidth() + cellSpace);

  linePosition.value.left.y =
    svgDimensions.value.top +
    lineNotation.fromRow * (notationStore.getCellVerticalHeight() + cellSpace);

  linePosition.value.right.x =
    svgDimensions.value.left +
    (lineNotation.toCol - 1) *
      (notationStore.getCellHorizontalWidth() + cellSpace);

  linePosition.value.right.y =
    svgDimensions.value.top +
    lineNotation.toRow * (notationStore.getCellVerticalHeight() + cellSpace);

  notationStore.selectNotation(lineNotation.uuid);

  eventBus.emit("slopeLineSelected", null); // to enable re selection
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
  if (editModeStore.isSlopeLineDrawingMode()) {
    resetLineDrawing();
  }

  // new line
  if (editModeStore.isLineStartedMode()) {
    startLineDrawing({
      x: e.offsetX,
      y: e.offsetY,
    });
    editModeStore.setNextEditMode();
  }
}

function setLine(xPos: number, yPos: number) {
  // nagtivve slope
  if (xPos <= linePosition.value.left.x) {
     const prevLeftX = linePosition.value.left.x
    linePosition.value.left.x = xPos;
    linePosition.value.right.x = prevLeftX;
    linePosition.value.left.y = yPos;
  }
  // positive slope
  else {
    linePosition.value.right.x = xPos;
    linePosition.value.right.y = yPos;
  }
}

function onMouseMove(e: MouseEvent) {
  console.debug("onMouseMove: buttons = " + e.buttons);

  // ignore right button
  if (e.buttons !== 1) {
    return;
  }

  // nothing done yet
  if (
    linePosition.value.left.x === 0 &&
    linePosition.value.left.y === 0 &&
    linePosition.value.right.x === 0 &&
    linePosition.value.right.y === 0
  ) {
    return;
  }

  if (!editModeStore.isSlopeLineDrawingMode()) {
    return;
  }

  console.debug("e.clientX:" + e.clientX + ",e.clientY:" + e.clientY);
  setLine(e.clientX, e.clientY);
}

function onMouseUp() {
  // drawing not started
  if (
    linePosition.value.left.x === 0 &&
    linePosition.value.left.y === 0 &&
    linePosition.value.right.x === 0 &&
    linePosition.value.right.y === 0
  ) {
    return;
  }

  // line yet not modified
  if (editModeStore.isSlopeLineDrawingMode()) {
    endDrawLine();
  }
}

// methods

function startLineDrawing(position: DotPosition) {
  linePosition.value.left.x = position.x + svgDimensions.value.left;
  linePosition.value.right.x = + 10

  linePosition.value.left.y = getNearestRow(position.y) + svgDimensions.value.top;
  linePosition.value.right.y = linePosition.value.left.y + 10;

  console.debug("startLineDrawing linePosition:");
  console.debug(linePosition);
}

function endDrawLine() {
  if (
    linePosition.value.left.x == linePosition.value.right.x &&
    linePosition.value.right.y == linePosition.value.right.y
  )
    return;

  let fromCol = Math.round(
    (linePosition.value.left.x - svgDimensions.value.left) /
      (notationStore.getCellHorizontalWidth() + cellSpace),
  );

  let toCol = Math.round(
    (linePosition.value.right.x - svgDimensions.value.left) /
      (notationStore.getCellHorizontalWidth() + cellSpace),
  );

  let fromRow = Math.round(
    (linePosition.value.left.y - svgDimensions.value.top) /
      (notationStore.getCellVerticalHeight() + cellSpace),
  );

  let toRow = Math.round(
    (linePosition.value.right.y - svgDimensions.value.top) /
      (notationStore.getCellVerticalHeight() + cellSpace),
  );

  saveLine({
      fromCol: fromCol,
      toCol: toCol,
      fromRow: fromRow,
      toRow: toRow,
    });

  editModeStore.resetEditMode();
}


function saveLine(lineAttributes: SlopeLineAttributes) {
  if (notationStore.getSelectedNotations().length > 0) {
    let updatedLine = {
      ...notationStore.getSelectedNotations().at(0)!,
      ...lineAttributes,
    };

    notationMutateHelper.updateSlopeLineNotation(
      updatedLine as SlopeLineNotationAttributes,
    );
  } else
    notationMutateHelper.addSlopeLineNotation(
      lineAttributes,
      editModeStore.getNotationTypeByEditMode(),
    );
}

function resetLineDrawing() {
  linePosition.value.left.x =
    linePosition.value.right.x =
    linePosition.value.left.y =
    linePosition.value.right.y =
      0;
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
