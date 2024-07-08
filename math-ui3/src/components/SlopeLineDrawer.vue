<template>
  <div v-show="show">
    <v-card
      id="lineLeftHandle"
      class="lineHandle"
      v-bind:style="{
        left: handleLeft + 'px',
        top: handleTop + 'px',
      }"
      v-on:mouseup="onMouseUp"
      v-on:mousedown="onHandleMouseDown"
    ></v-card>
    <v-card
      id="lineRightHandle"
      class="lineHandle"
      v-bind:style="{
        left: handleRight + 'px',
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
        :x1="lineLeft"
        :y1="lineTop"
        :x2="lineRight"
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
import {
  SlopeLinePosition,
  cellSpace,
  DotPosition,
} from "../../../math-common/src/globals";
import {
  SlopeLineAttributes,
  SlopeLineNotationAttributes,
} from "../../../math-common/src/baseTypes";
import useEventBus from "../helpers/eventBusHelper";

const eventBus = useEventBus();
const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();

type SlopeType = "POSITIVE" | "NEGATIVE" | "NONE";
const slopeType = ref<SlopeType>("NONE");

type MovementDirection = "UP" | "DOWN" | "NONE";
const movementDirection = ref<MovementDirection>("NONE");

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
    editModeStore.isSlopeLineDrawingMode() ||
    editModeStore.isSlopeLineSelectedMode()
  );
});

let lineLeft = computed(() => {
  return linePosition.value.left.x;
});

let lineRight = computed(() => {
  return linePosition.value.right.x;
});

let lineBottom = computed(() => {
  return linePosition.value.right.y;
});

let lineTop = computed(() => {
  return linePosition.value.left.y;
});

let handleLeft = computed(() => {
  return lineLeft.value + (svgDimensions()?.left ?? 0);
});

let handleRight = computed(() => {
  return lineRight.value + (svgDimensions()?.left ?? 0);
});

let handleTop = computed(() => {
  return lineTop.value + (svgDimensions()?.top ?? 0);
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
  () => eventBus.bus.value.get("SLOPE_LINE_SELECTED"), /// TODO: update emitter to distinguish line types
  (line: SlopeLineNotationAttributes) => {
    if (line) onSlopeLineSelected(line);
  },
);

// event handlers

function onSlopeLineSelected(lineNotation: SlopeLineNotationAttributes) {
  linePosition.value.left.x =
    lineNotation.fromCol * (cellStore.getCellHorizontalWidth() + cellSpace);

  linePosition.value.left.y =
    lineNotation.fromRow * (cellStore.getCellVerticalHeight() + cellSpace);

  linePosition.value.right.x =
    lineNotation.toCol * (cellStore.getCellHorizontalWidth() + cellSpace);

  linePosition.value.right.y =
    lineNotation.toRow * (cellStore.getCellVerticalHeight() + cellSpace);

  notationStore.selectNotation(lineNotation.uuid);

  eventBus.emit("SLOPE_LINE_SELECTED", null); // to enable re selection
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
  if (editModeStore.isSlopeLineDrawingMode()) {
    resetLineDrawing();
  }

  // new line
  if (editModeStore.isSlopeLineStartedMode()) {
    startLineDrawing({
      x: e.offsetX,
      y: e.offsetY,
    });
    editModeStore.setNextEditMode();
  }
}

function setLine(xPos: number, yPos: number) {
  if (slopeType.value === "NONE") {
    setSlopeType(xPos, yPos);
  }

  if (movementDirection.value === "NONE") {
    movementDirection.value =
      (slopeType.value === "POSITIVE" && yPos > linePosition.value.right.y) ||
      (slopeType.value === "NEGATIVE" && yPos > linePosition.value.left.y)
        ? "DOWN"
        : "UP";
  }

  // 4 options for drawing sloped line:
  // 1. upper left to lower right.
  // 2  lower right to upper left.
  // 3. upper right to lower left.
  // 4. lower left to upper right.

  const modifyRight =
    (slopeType.value === "POSITIVE" && movementDirection.value === "UP") ||
    (slopeType.value === "NEGATIVE" && movementDirection.value === "DOWN");

  if (modifyRight) {
    linePosition.value.right.x = xPos;
    linePosition.value.right.y = yPos;
  } else {
    linePosition.value.left.x = xPos;
    linePosition.value.left.y = yPos;
  }
}

function setSlopeType(xPos: number, yPos: number) {
  if (
    (yPos < linePosition.value.right.y &&
      xPos > linePosition.value.right.x) /*moving up and right*/ ||
    (yPos > linePosition.value.right.y && xPos < linePosition.value.right.x)
  ) {
    /*moving down and left*/
    slopeType.value = "POSITIVE";
  } else {
    slopeType.value = "NEGATIVE";
  }
}

function onMouseMove(e: MouseEvent) {
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

  setLine(e.offsetX, e.offsetY);
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

function svgDimensions(): DOMRect | undefined {
  return document.getElementById(props.svgId)?.getBoundingClientRect();
}

function startLineDrawing(position: DotPosition) {
  slopeType.value = "NONE";
  movementDirection.value = "NONE";

  linePosition.value.left.x = linePosition.value.right.x = position.x;
  linePosition.value.left.y = linePosition.value.right.y = position.y;
  console.debug(position);
}

function endDrawLine() {
  if (
    linePosition.value.left.x == linePosition.value.right.x &&
    linePosition.value.right.y == linePosition.value.right.y
  )
    return;

  let fromCol = Math.round(
    linePosition.value.left.x /
      (cellStore.getCellHorizontalWidth() + cellSpace),
  );

  let toCol = Math.round(
    linePosition.value.right.x /
      (cellStore.getCellHorizontalWidth() + cellSpace),
  );

  let fromRow = Math.round(
    linePosition.value.left.y /
      (cellStore.getCellVerticalHeight() + cellSpace),
  );

  let toRow = Math.round(
    linePosition.value.right.y /
      (cellStore.getCellVerticalHeight() + cellSpace),
  );

  saveLine({
    fromCol: fromCol,
    toCol: toCol,
    fromRow: fromRow,
    toRow: toRow,
  });

  editModeStore.setDefaultEditMode();
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
  editModeStore.setDefaultEditMode();
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
