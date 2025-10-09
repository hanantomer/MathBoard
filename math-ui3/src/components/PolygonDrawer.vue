<template>
  <div v-show="show">
    <lineWatcher
      :startEntry="{
        editMode: ['POLYGON_STARTED'],
        func: setInitialPosition,
      }"
      :drawEntry="{
        editMode: ['POLYGON_DRAWING'],
        func: drawLine,
      }"
      :editEntryFirstHandle="{
        editMode: [],
        func: () => {},
      }"
      :editEntrySecondHandle="{
        editMode: [],
        func: () => {},
      }"
      :saveEntry="{
        editMode: ['POLYGON_DRAWING'],
        func: endDrawing,
      }"
      :selectEntry="{
        editMode: [],
        func: () => {},
        event: 'EV_LINE_SELECTED',
      }"
      :moveByKeyEntry="{
        editMode: [],
        func: () => {},
      }"
      :endEntry="{
        editMode: [],
      }"
    />

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
import { computed, ref, watch } from "vue";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useNotationStore } from "../store/pinia/notationStore";
import useWatchHelper from "../helpers/watchHelper";
import {
  SlopeType,
  LineAttributes,
  MovementDirection,
  DotCoordinates,
  LineNotationAttributes,
  NotationAttributes,
} from "../../../math-common/src/baseTypes";
import useEventBus from "../helpers/eventBusHelper";
import lineWatcher from "./LineWatcher.vue";
import useScreenHelper from "../helpers/screenHelper"; // Add this line
import useNotationMutateHelper from "../helpers/notationMutateHelper"; // Add this line
const watchHelper = useWatchHelper();

const eventBus = useEventBus();
const editModeStore = useEditModeStore();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const screenHelper = useScreenHelper();
const notationMutateHelper = useNotationMutateHelper();

// vars

let movementDirection: MovementDirection = "NONE";

let slopeType: SlopeType = "NONE";

const linePosition = ref<LineAttributes>({
  p1x: 0,
  p2x: 0,
  p1y: 0,
  p2y: 0,
  dashed: false,
  arrowLeft: false,
  arrowRight: false
});

const modifyRight = computed(
  () =>
    (slopeType === "POSITIVE" && movementDirection === "UP") ||
    (slopeType === "NEGATIVE" && movementDirection === "DOWN"),
);

// Watch for any change in linePosition's properties
watch(
  linePosition,
  (newVal) => {
    const height = Math.round(
      Math.abs(newVal.p2y - newVal.p1y) / cellStore.getCellHorizontalWidth(),
    );
    const width = Math.round(
      Math.abs(newVal.p2x - newVal.p1x) / cellStore.getCellHorizontalWidth(),
    );
    const LineStatus = `Line width: ${width}, Line height: ${height}`;
    eventBus.emit("EV_LINE_CHANGED", LineStatus);
  },
  { deep: true },
);

// computed

const show = computed(() => {
  return editModeStore.isPolygonDrawingMode();
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

  if (modifyRight.value) {
    linePosition.value.p2x = p.x;
    linePosition.value.p2y = p.y;
  } else {
    linePosition.value.p1x = p.x;
    linePosition.value.p1y = p.y;
  }
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

function getMovementDirection(yPos: number): MovementDirection {
  return (slopeType === "POSITIVE" && yPos > linePosition.value.p2y) ||
    (slopeType === "NEGATIVE" && yPos > linePosition.value.p1y)
    ? "DOWN"
    : "UP";
}

function editNotStarted(): boolean {
  return (
    Math.abs(linePosition.value.p1x - linePosition.value.p2x) < 5 &&
    Math.abs(linePosition.value.p1y - linePosition.value.p2y) < 5
  );
}

async function endDrawing(): Promise<string> {
  if (editNotStarted()) {
    editModeStore.setDefaultEditMode();
    return "";
  }

  // check if polygon is closed
  const nearLineAtEnd = screenHelper.getNearestLineEdge(
    modifyRight.value
      ? {
          x: linePosition.value.p2x,
          y: linePosition.value.p2y,
        }
      : {
          x: linePosition.value.p1x,
          y: linePosition.value.p1y,
        },
  );

  const uuid = await saveLine();

  if (nearLineAtEnd != null) {
    setTimeout(() => {
      // let the line be drawn before we set next edit mode
      editModeStore.setDefaultEditMode();
    }, 1);

    return uuid;
  }

  // set next line start from end of current line
  if (modifyRight.value) {
    linePosition.value.p1x = linePosition.value.p2x;
    linePosition.value.p1y = linePosition.value.p2y;
  } else {
    linePosition.value.p2x = linePosition.value.p1x;
    linePosition.value.p2y = linePosition.value.p1y;
  }

  return uuid;
}

async function saveLine(fixEdge: boolean = true): Promise<string> {
  if (fixEdge) {
    linePosition.value.p1x = getAdjustedEdge({
      x: linePosition.value.p1x,
      y: linePosition.value.p1y,
    }).x;

    linePosition.value.p1y = getAdjustedEdge({
      x: linePosition.value.p1x,
      y: linePosition.value.p1y,
    }).y;

    linePosition.value.p2x = getAdjustedEdge({
      x: linePosition.value.p2x,
      y: linePosition.value.p2y,
    }).x;

    linePosition.value.p2y = getAdjustedEdge({
      x: linePosition.value.p2x,
      y: linePosition.value.p2y,
    }).y;
  }

  if (notationStore.getSelectedNotations().length > 0) {
    let updatedLine = {
      ...notationStore.getSelectedNotations().at(0)!,
      ...linePosition.value,
    };

    notationMutateHelper.updateLineNotation(
      updatedLine as LineNotationAttributes,
    );
    return updatedLine.uuid;
  } else {
    return notationMutateHelper.addLineNotation(linePosition.value);
  }
}

function getAdjustedEdge(point: DotCoordinates): DotCoordinates {
  // line edge at left
  const nearLineAtLeft = screenHelper.getNearestLineEdge(point);

  if (nearLineAtLeft != null) {
    return { x: nearLineAtLeft.x, y: nearLineAtLeft.y };
  }

  // circle edge at left
  const nearCircleAtLeft = screenHelper.getNearestCircleEdge(point);

  if (nearCircleAtLeft != null) {
    return { x: nearCircleAtLeft.x, y: nearCircleAtLeft.y };
  }

  // intersection with other line
  const nearestIntersection = screenHelper.getNearestNotationPoint(point);

  if (nearestIntersection != null) {
    return { x: nearestIntersection.x, y: nearestIntersection.y };
  }

  // cell X edge
  const nearCellXBorder = screenHelper.getNearestCellXBorder(point);

  if (nearCellXBorder != null) {
    return { x: nearCellXBorder, y: point.y };
  }

  // cell Y edge at right
  const nearCellYBorder = screenHelper.getNearestCellYBorder(point);

  if (nearCellYBorder != null) {
    return { x: point.x, y: nearCellYBorder };
  }

  return point;
}
</script>
