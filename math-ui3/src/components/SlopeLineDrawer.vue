<template>
  <div v-show="show">
    <lineWatcher
      :startEntry="{
        editMode: ['SLOPE_LINE_STARTED', 'POLYGON_STARTED'],
        func: setInitialPosition,
      }"
      :drawEntry="{
        editMode: ['SLOPE_LINE_DRAWING', 'POLYGON_DRAWING'],
        func: drawLine,
      }"
      :editEntryFirstHandle="{
        editMode: ['SLOPE_LINE_EDITING_LEFT'],
        func: modifyLineLeft,
      }"
      :editEntrySecondHandle="{
        editMode: ['SLOPE_LINE_EDITING_RIGHT'],
        func: modifyLineRight,
      }"
      :endEntry="{
        editMode: [
          'SLOPE_LINE_DRAWING',
          'SLOPE_LINE_EDITING_RIGHT',
          'SLOPE_LINE_EDITING_LEFT',
          'SLOPE_LINE_SELECTED',
          'POLYGON_DRAWING'
        ],
        func: endDrawing,
      }"
      :selectEntry="{
        editMode: ['SLOPE_LINE_SELECTED'],
        func: selectLine,
        event: 'EV_SLOPE_LINE_SELECTED', ///TODO handle polygon
      }"
      :moveByKeyEntry="{
        editMode: ['SLOPE_LINE_SELECTED'],
        func: moveLine,
      }"
      :endSelectionEntry="{
        editMode: ['SLOPE_LINE_SELECTED'],
      }"
    />

    <line-handle
      drawing-mode="SLOPE_LINE_DRAWING"
      editing-mode="SLOPE_LINE_EDITING_LEFT"
      v-bind:style="{
        left: handleLeft + 'px',
        top: handleTop + 'px',
      }"
    ></line-handle>
    <line-handle
      drawing-mode="SLOPE_LINE_DRAWING"
      editing-mode="SLOPE_LINE_EDITING_RIGHT"
      v-bind:style="{
        left: handleRight + 'px',
        top: handleBottom + 'px',
      }"
    ></line-handle>

    <svg
      height="800"
      width="1500"
      xmlns="http://www.w3.org/2000/svg"
      class="line-svg"
    >
      <line
        :x1="linePosition.p1x"
        :y1="linePosition.p1y"
        :x2="linePosition.p2x"
        :y2="linePosition.p2y"
        class="line"
      />
    </svg>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useNotationStore } from "../store/pinia/notationStore";
import {
  SlopeType,
  SlopeLineAttributes,
  MovementDirection,
  DotCoordinates,
  SlopeLineNotationAttributes,
  NotationAttributes,
} from "../../../math-common/src/baseTypes";
import lineWatcher from "./LineWatcher.vue";
import lineHandle from "./LineHandle.vue";
import useScreenHelper from "../helpers/screenHelper"; // Add this line
import useNotationMutateHelper from "../helpers/notationMutateHelper"; // Add this line

const editModeStore = useEditModeStore();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const screenHelper = useScreenHelper();
const notationMutateHelper = useNotationMutateHelper();

// vars

let modifyRight = false;

let movementDirection: MovementDirection = "NONE";

let slopeType: SlopeType = "NONE";

const linePosition = ref<SlopeLineAttributes>({
  p1x: 0,
  p2x: 0,
  p1y: 0,
  p2y: 0,
});

// computed

const show = computed(() => {
  return (
    editModeStore.isSlopeLineDrawingMode() ||
    editModeStore.isSlopeLineSelectedMode() ||
    editModeStore.isSlopeLineEditingMode()
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

function setInitialPosition(p: DotCoordinates) {
  linePosition.value.p1x = p.x;
  linePosition.value.p2x = p.x;
  linePosition.value.p1y = p.y;
  linePosition.value.p2y = p.y;
  slopeType = "NONE";
  movementDirection = "NONE";
}

function drawLine(p: DotCoordinates) {
  if (slopeType === "NONE") {
    slopeType = getSlopeTypeForNewLine(p.x, p.y);
  }

  if (movementDirection === "NONE") {
    movementDirection = getMovementDirection(p.y);
  }

  // 4 options for drawing sloped line:
  // 1. upper left to lower right. direction is DOWN and slopeType is NEGATIVE
  // 2  lower right to upper left. direction is UP and slopeType is NEGATIVE
  // 3. upper right to lower left. direction is DOWN and slopeType is POSITIVE
  // 4. lower left to upper right. direction is UP and slopeType is POSITIVE

  modifyRight =
    (slopeType === "POSITIVE" && movementDirection === "UP") ||
    (slopeType === "NEGATIVE" && movementDirection === "DOWN");

  if (modifyRight) {
    linePosition.value.p2x = p.x;
    linePosition.value.p2y = p.y;
  } else {
    linePosition.value.p1x = p.x;
    linePosition.value.p1y = p.y;
  }
}

function selectLine(notation: NotationAttributes) {
  const n = notation as SlopeLineNotationAttributes;

  slopeType = getSlopeTypeForExistingLine(n);

  linePosition.value.p1x = n.p1x;
  linePosition.value.p2x = n.p2x;
  linePosition.value.p1y = n.p1y;
  linePosition.value.p2y = n.p2y;
}

function modifyLineLeft(p: DotCoordinates) {
  movementDirection = getMovementDirection(p.x);

  linePosition.value.p1x = p.x;
  linePosition.value.p1y = p.y;
}

function modifyLineRight(p: DotCoordinates) {
  movementDirection = getMovementDirection(p.y);

  linePosition.value.p2x = p.x;
  linePosition.value.p2y = p.y;
}

function getSlopeTypeForNewLine(xPos: number, yPos: number): SlopeType {
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

function getSlopeTypeForExistingLine(
  slopeLine: SlopeLineAttributes,
): SlopeType {
  return slopeLine.p2y < slopeLine.p1y ? "POSITIVE" : "NEGATIVE";
}

function getMovementDirection(yPos: number): MovementDirection {
  return (slopeType === "POSITIVE" && yPos > linePosition.value.p2y) ||
    (slopeType === "NEGATIVE" && yPos > linePosition.value.p1y)
    ? "DOWN"
    : "UP";
}

function endDrawing() {
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

  saveSlopeLine();
}

function saveSlopeLine() {
  fixLineLeftEdge(linePosition.value);
  fixLineRightEdge(linePosition.value);

  if (notationStore.getSelectedNotations().length > 0) {
    let updatedLine = {
      ...notationStore.getSelectedNotations().at(0)!,
      ...linePosition.value,
    };

    notationMutateHelper.updateSlopeLineNotation(
      updatedLine as SlopeLineNotationAttributes,
    );
  } else {
    notationMutateHelper.addSlopeLineNotation(linePosition.value);
  }
}

/*
function fixLineEdge() {

  // right
  const nearLineRightEdge = screenHelper.getNearestNotationEdge({
    x: linePosition.value.p1x,
    y: linePosition.value.p1y,
  });

  if (nearLineRightEdge == null) {
    screenHelper.getClos
  }

  if (nearLineRightEdge != null) {
    linePosition.value.p1x = nearLineRightEdge.x;
    linePosition.value.p1y = nearLineRightEdge.y;
  }


  const nearLineLeftEdge = screenHelper.getCloseNotationEdge({
    x: linePosition.value.p2x,
    y: linePosition.value.p2y,
  });

  if (nearLineLeftEdge != null) {
    linePosition.value.p2x = nearLineLeftEdge.x;
    linePosition.value.p2y = nearLineLeftEdge.y;
  }
}*/

function fixLineRightEdge(linePosition: SlopeLineAttributes) {
  const lineRightPosition = {
    x: linePosition.p2x,
    y: linePosition.p2y,
  };

  // notation edge at right
  const nearNoatationAtRight =
    screenHelper.getNearestNotationEdge(lineRightPosition);

  if (nearNoatationAtRight != null) {
    linePosition.p2x = nearNoatationAtRight.x;
    linePosition.p2y = nearNoatationAtRight.y;
  }

  if (nearNoatationAtRight == null) {
    // cell X edge at right
    const nearCellXBorderAtRight =
      screenHelper.getNearestCellXBorder(lineRightPosition);

    if (nearCellXBorderAtRight != null) {
      linePosition.p2x = nearCellXBorderAtRight;
    }

    // cell Y edge at right
    const nearCellYBorderAtRight =
      screenHelper.getNearestCellYBorder(lineRightPosition);

    if (nearCellYBorderAtRight != null) {
      linePosition.p2y = nearCellYBorderAtRight;
    }
  }
}

function fixLineLeftEdge(linePosition: SlopeLineAttributes) {
  const lineLeftPosition = {
    x: linePosition.p1x,
    y: linePosition.p1y,
  };

  // notation edge at left
  const nearNoatationAtLeft =
    screenHelper.getNearestNotationEdge(lineLeftPosition);

  if (nearNoatationAtLeft != null) {
    linePosition.p1x = nearNoatationAtLeft.x;
    linePosition.p1y = nearNoatationAtLeft.y;
  }

  if (nearNoatationAtLeft == null) {
    // cell X edge at left
    const nearCellXBorderAtLeft =
      screenHelper.getNearestCellXBorder(lineLeftPosition);

    if (nearCellXBorderAtLeft != null) {
      linePosition.p1x = nearCellXBorderAtLeft;
    }

    // cell Y edge at right
    const nearCellYBorderAtLeft =
      screenHelper.getNearestCellYBorder(lineLeftPosition);

    if (nearCellYBorderAtLeft != null) {
      linePosition.p1y = nearCellYBorderAtLeft;
    }
  }
}

function moveLine(moveX: number, moveY: number) {
  linePosition.value.p1y += moveY;
  linePosition.value.p2y += moveY;
  linePosition.value.p1x += moveX;
  linePosition.value.p2x += moveX;
  saveSlopeLine;
}
</script>
