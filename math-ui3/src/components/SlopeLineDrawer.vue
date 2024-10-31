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
        :x1="linePosition.x1"
        :y1="linePosition.y1"
        :x2="linePosition.x2"
        :y2="linePosition.x1"
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
  x1: 0,
  x2: 0,
  y1: 0,
  y2: 0,
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
  return linePosition.value.x1 + (cellStore.getSvgBoundingRect().left ?? 0);
});

let handleRight = computed(() => {
  return linePosition.value.x2 + (cellStore.getSvgBoundingRect().left ?? 0);
});

let handleTop = computed(() => {
  return linePosition.value.y1 + (cellStore.getSvgBoundingRect().top ?? 0);
});

let handleBottom = computed(() => {
  return linePosition.value.y2 + (cellStore.getSvgBoundingRect().top ?? 0);
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
  if (linePosition.value.y1) return;

  slopeType.value = "NONE";
  movementDirection.value = "NONE";

  const position = {
    x: e.pageX - cellStore.getSvgBoundingRect().x,
    y: e.pageY - cellStore.getSvgBoundingRect().y,
  };

  linePosition.value.x1 = linePosition.value.x2 = position.x;
  linePosition.value.y1 = linePosition.value.y2 = position.y;
}

function setLine(e: MouseEvent) {
  const yPos = e.pageY - (cellStore.getSvgBoundingRect()?.y ?? 0);
  const xPos = e.pageX - (cellStore.getSvgBoundingRect()?.x ?? 0);

  if (slopeType.value === "NONE") {
    slopeType.value = getSlopeType(xPos, yPos);
  }

  if (movementDirection.value === "NONE") {
    movementDirection.value =
      (slopeType.value === "POSITIVE" && yPos > linePosition.value.y2) ||
      (slopeType.value === "NEGATIVE" && yPos > linePosition.value.y1)
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
    linePosition.value.x2 = xPos;
    linePosition.value.y2 = yPos;
  } else {
    linePosition.value.x1 = xPos;
    linePosition.value.y1 = yPos;
  }
}

function getSlopeType(xPos: number, yPos: number): SlopeType {
  if (
    /*moving up and right*/
    (yPos < linePosition.value.y2 && xPos > linePosition.value.x2) ||
    /*moving down and left*/
    (yPos > linePosition.value.y2 && xPos < linePosition.value.x2)
  ) {
    return "POSITIVE";
  }

  return "NEGATIVE";
}

function endDrawLine() {
  if (
    linePosition.value.x1 === 0 &&
    linePosition.value.y1 === 0 &&
    linePosition.value.x2 === 0 &&
    linePosition.value.y2 === 0
  ) {
    return;
  }

  if (
    linePosition.value.x1 == linePosition.value.x2 &&
    linePosition.value.y2 == linePosition.value.y2
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
  linePosition.value.x1 =
    linePosition.value.x2 =
    linePosition.value.y1 =
    linePosition.value.y2 =
      0;
  editModeStore.setDefaultEditMode();
}
</script>
