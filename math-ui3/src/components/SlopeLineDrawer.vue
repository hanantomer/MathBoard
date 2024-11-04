<template>
  <div v-show="show">
    <v-card
      id="lineLeftHandle"
      class="lineHandle"
      v-bind:style="{
        left: handleLeft + 'px',
        top: handleTop + 'px',
      }"
      v-on:mouseup="endDrawLine"
    ></v-card>
    <v-card
      id="lineRightHandle"
      class="lineHandle"
      v-bind:style="{
        left: handleRight + 'px',
        top: handleBottom + 'px',
      }"
      v-on:mouseup="endDrawLine"
    ></v-card>

    <svg
      height="800"
      width="1500"
      xmlns="http://www.w3.org/2000/svg"
      style="position: absolute; pointer-events: none"
    >
      <line
        :x1="linePosition.p1x"
        :y1="linePosition.p1y"
        :x2="linePosition.p2x"
        :y2="linePosition.p1x"
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
import { SlopeLinePosition } from "../../../math-common/src/baseTypes";
import {
  SlopeLineAttributes,
  SlopeLineNotationAttributes,
} from "../../../math-common/src/baseTypes";
import useWatchHelper from "../helpers/watchHelper";

const watchHelper = useWatchHelper();
const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();

// vars

const linePosition = ref(<SlopeLinePosition>{
  p1x: 0,
  p2x: 0,
  p1y: 0,
  p2y: 0,
});

type SlopeType = "POSITIVE" | "NEGATIVE" | "NONE";
const slopeType = ref<SlopeType>("NONE");

type MovementDirection = "UP" | "DOWN" | "NONE";
const movementDirection = ref<MovementDirection>("NONE");

// computed

const show = computed(() => {
  return (
    editModeStore.isSlopeLineDrawingMode() ||
    editModeStore.isSlopeLineSelectedMode()
  );
});

let handleLeft = computed(() => {
  return linePosition.value.p1x + (cellStore.getSvgBoundingRect().left ?? 0);
});

let handleRight = computed(() => {
  return linePosition.value.p2x + (cellStore.getSvgBoundingRect().left ?? 0);
});

let handleTop = computed(() => {
  return linePosition.value.p1y + (cellStore.getSvgBoundingRect().top ?? 0);
});

let handleBottom = computed(() => {
  return linePosition.value.p2y + (cellStore.getSvgBoundingRect().top ?? 0);
});

// watchers

watchHelper.watchMouseEvent(
  ["SLOPE_LINE_STARTED"],
  "EV_SVG_MOUSEDOWN",
  startDrawLine,
);

watchHelper.watchMouseEvent(
  ["SLOPE_LINE_DRAWING"],
  "EV_SVG_MOUSEMOVE",
  setLine,
);

watchHelper.watchMouseEvent(
  ["SLOPE_LINE_DRAWING"],
  "EV_SVG_MOUSEUP",
  endDrawLine,
);

// emmited by selection helper
watchHelper.watchNotationSelection(
  "SLOPE_LINE_SELECTED",
  "EV_HORIZONTAL_LINE_SELECTED",
  selectLine,
);

watchHelper.watchMouseEvent(
  ["SLOPE_LINE_SELECTED"],
  "EV_SVG_MOUSEDOWN",
  resetLineDrawing,
);

watchHelper.watchMouseEvent(["SLOPE_LINE_SELECTED"], "EV_SVG_MOUSEUP", () =>
  editModeStore.setDefaultEditMode(),
);

// methods

function selectLine(lineNotation: SlopeLineNotationAttributes) {
  Object.assign(linePosition.value, lineNotation);
  notationStore.selectNotation(lineNotation.uuid);
}

function startDrawLine(e: MouseEvent) {
  editModeStore.setNextEditMode();
  if (linePosition.value.p1y) return;

  slopeType.value = "NONE";
  movementDirection.value = "NONE";

  const position = {
    x: e.pageX - cellStore.getSvgBoundingRect().x,
    y: e.pageY - cellStore.getSvgBoundingRect().y,
  };

  linePosition.value.p1x = linePosition.value.p2x = position.x;
  linePosition.value.p1y = linePosition.value.p2y = position.y;
}

function setLine(e: MouseEvent) {
  const yPos = e.pageY - (cellStore.getSvgBoundingRect()?.y ?? 0);
  const xPos = e.pageX - (cellStore.getSvgBoundingRect()?.x ?? 0);

  if (slopeType.value === "NONE") {
    slopeType.value = getSlopeType(xPos, yPos);
  }

  if (movementDirection.value === "NONE") {
    movementDirection.value =
      (slopeType.value === "POSITIVE" && yPos > linePosition.value.p2y) ||
      (slopeType.value === "NEGATIVE" && yPos > linePosition.value.p1y)
        ? "DOWN"
        : "UP";
  }

  // 4 options for drawing sloped line:
  // 1. upper left to lower right. direction is DOWN and slopeType is NEGATIVE
  // 2  lower right to upper left. direction is UP and slopeType is NEGATIVE
  // 3. upper right to lower left. direction is DOWN and slopeType is POSITIVE
  // 4. lower left to upper right. direction is UP and slopeType is POSITIVE

  const modifyRight =
    (slopeType.value === "POSITIVE" && movementDirection.value === "UP") ||
    (slopeType.value === "NEGATIVE" && movementDirection.value === "DOWN");

  if (modifyRight) {
    linePosition.value.p2x = xPos;
    linePosition.value.p2y = yPos;
  } else {
    linePosition.value.p1x = xPos;
    linePosition.value.p1y = yPos;
  }
}

function getSlopeType(xPos: number, yPos: number): SlopeType {
  if (
    /*moving up and right*/
    (yPos < linePosition.value.p2y && xPos > linePosition.value.p2x) ||
    /*moving down and left*/
    (yPos > linePosition.value.p2y && xPos < linePosition.value.p2x)
  ) {
    return "POSITIVE";
  }

  return "NEGATIVE";
}

function endDrawLine() {
  if (
    linePosition.value.p1x === 0 &&
    linePosition.value.p1y === 0 &&
    linePosition.value.p2x === 0 &&
    linePosition.value.p2y === 0
  ) {
    return;
  }

  if (
    linePosition.value.p1x == linePosition.value.p2x &&
    linePosition.value.p2y == linePosition.value.p2y
  ) {
    return;
  }

  saveLine(linePosition.value);

  resetLineDrawing();
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
  linePosition.value.p1x =
    linePosition.value.p2x =
    linePosition.value.p1y =
    linePosition.value.p2y =
      0;
  editModeStore.setDefaultEditMode();
}
</script>
