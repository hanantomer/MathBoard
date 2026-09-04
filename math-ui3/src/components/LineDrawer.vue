<template>
  <div v-show="show">
    <lineWatcher
      :startEntry="{
        editMode: ['LINE_STARTED'],
        func: setInitialPosition,
      }"
      :drawEntry="{
        editMode: ['LINE_DRAWING'],
        func: drawLine,
      }"
      :editEntryFirstHandle="{
        editMode: ['LINE_EDITING_LEFT'],
        func: modifyLineLeft,
      }"
      :editEntrySecondHandle="{
        editMode: ['LINE_EDITING_RIGHT'],
        func: modifyLineRight,
      }"
      :saveEntry="{
        editMode: ['LINE_DRAWING', 'LINE_EDITING_RIGHT', 'LINE_EDITING_LEFT'],
        func: endDrawing,
      }"
      :selectEntry="{
        editMode: ['LINE_SELECTED'],
        func: selectLine,
        event: 'EV_LINE_SELECTED',
      }"
      :moveByKeyEntry="{
        editMode: ['LINE_SELECTED'],
        func: moveLine,
      }"
      :endEntry="{
        editMode: ['LINE_SELECTED'],
      }"
    />
    <line-handle
      data-cy="lineLeftHandle"
      v-show="showLeftHandle"
      drawing-mode="LINE_DRAWING"
      editing-mode="LINE_EDITING_LEFT"
      v-bind:style="{
        left: handleLeft + 'px',
        top: handleTop + 'px',
      }"
    ></line-handle>
    <line-handle
      data-cy="lineRightHandle"
      v-show="showRightHandle"
      drawing-mode="LINE_DRAWING"
      editing-mode="LINE_EDITING_RIGHT"
      v-bind:style="{
        left: handleRight + 'px',
        top: handleBottom + 'px',
      }"
    ></line-handle>
    <line-junction-handle
      v-for="junction in lineJunctions"
      :key="junctionKey(junction)"
      editing-mode="LINE_EDITING_LEFT"
      v-show="handlesInteractive"
      v-bind:style="{
        left: junctionScreenLeft(junction) + 'px',
        top: junctionScreenTop(junction) + 'px',
      }"
      @edit-start="startJunctionEdit(junction)"
    />

    <svg
      :style="lineSvgScreenStyle"
      :viewBox="overlayViewBox"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      class="line-svg"
    >
      <line
        :x1="lineAttributes.p1x"
        :y1="lineAttributes.p1y"
        :x2="lineAttributes.p2x"
        :y2="lineAttributes.p2y"
        class="line"
        :class="{ dashed: lineAttributes.dashed }"
        :marker-start="lineAttributes.arrowLeft ? 'url(#arrowleft)' : ''"
        :marker-end="lineAttributes.arrowRight ? 'url(#arrowright)' : ''"
        vector-effect="non-scaling-stroke"
        stroke-linecap="square"
        :stroke="lineColor"
        data-cy="lineDrawer"
      />
    </svg>
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useNotationStore } from "../store/pinia/notationStore";
import {
  SlopeType,
  LineAttributes,
  MovementDirection,
  DotCoordinates,
  LineNotationAttributes,
  NotationAttributes,
} from "common/baseTypes";
import useEventBus from "../helpers/eventBusHelper";
import lineWatcher from "./LineWatcher.vue";
import lineHandle, { LINE_HANDLE_HALF } from "./LineHandle.vue";
import lineJunctionHandle from "./LineJunctionHandle.vue";
import useScreenHelper from "../helpers/screenHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import {
  getBoardSvgUserExtent,
  svgUserToViewport,
} from "../helpers/pointerCoordinateHelper";
import {
  applyJunctionPoint,
  collectJunctionLineUuids,
  findJunctionsForLine,
  isEndpointInJunction,
  junctionKey,
  type LineJunction,
} from "../helpers/lineJunctionHelper";
import { matrixSize } from "common/globals";

const eventBus = useEventBus();
const editModeStore = useEditModeStore();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const screenHelper = useScreenHelper();
const notationMutateHelper = useNotationMutateHelper();

// vars

let movementDirection: MovementDirection = "NONE";

let slopeType: SlopeType = "NONE";

const lineColor = ref<string | undefined>("black");

const activeJunction = ref<LineJunction | null>(null);

const selectedLineUuid = computed(
  () => notationStore.getSelectedNotations()[0]?.uuid ?? "",
);

const lineJunctions = computed(() => {
  if (!selectedLineUuid.value) {
    return [];
  }
  return findJunctionsForLine(
    notationStore.getNotations(),
    selectedLineUuid.value,
  );
});

const handlesInteractive = computed(
  () =>
    editModeStore.isLineSelectedMode() || editModeStore.isLineEditingMode(),
);

const showLeftHandle = computed(
  () =>
    handlesInteractive.value &&
    !isEndpointInJunction(lineJunctions.value, selectedLineUuid.value, "p1"),
);

const showRightHandle = computed(
  () =>
    handlesInteractive.value &&
    !isEndpointInJunction(lineJunctions.value, selectedLineUuid.value, "p2"),
);

const lineAttributes = ref<LineAttributes>({
  p1x: 0,
  p2x: 0,
  p1y: 0,
  p2y: 0,
  dashed: false,
  arrowLeft: false,
  arrowRight: false,
});

watch(
  () => ({
    mode: editModeStore.getEditMode(),
    selected: notationStore.getSelectedNotations()[0],
  }),
  ({ mode, selected }) => {
    if (
      selected?.notationType !== "LINE" ||
      (mode !== "LINE_SELECTED" &&
        mode !== "LINE_EDITING_LEFT" &&
        mode !== "LINE_EDITING_RIGHT")
    ) {
      return;
    }
    if (mode === "LINE_SELECTED") {
      selectLine(selected);
    }
  },
);

const modifyRight = computed(
  () =>
    (slopeType === "POSITIVE" && movementDirection === "UP") ||
    (slopeType === "NEGATIVE" && movementDirection === "DOWN"),
);

// Watch for any change in lineAttributes's properties
watch(
  lineAttributes,
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
  return (
    editModeStore.isLineDrawingMode() ||
    editModeStore.isLineSelectedMode() ||
    editModeStore.isLineEditingMode()
  );
});

watch(show, async (visible) => {
  if (visible) {
    await nextTick();
    const id = cellStore.getSvgId();
    if (id) {
      cellStore.setSvgBoundingRect(id);
    }
  }
});

/** Same viewport box as the board SVG; viewBox maps overlay user units onto that box. */
const overlayViewBox = computed(() => {
  cellStore.getSvgBoundingRect();
  const e = getBoardSvgUserExtent();
  if (!e.width || !e.height) {
    return undefined;
  }
  return `${e.x} ${e.y} ${e.width} ${e.height}`;
});

const lineSvgScreenStyle = computed(() => {
  const r = cellStore.getSvgBoundingRect();
  return {
    position: "fixed" as const,
    top: `${r.top}px`,
    left: `${r.left}px`,
    width: r.width ? `${r.width}px` : matrixSize.width,
    height: r.height ? `${r.height}px` : matrixSize.height,
    margin: "0",
    overflow: "visible",
    zIndex: 998,
    pointerEvents: "none" as const,
  };
});

const HANDLE_HALF = LINE_HANDLE_HALF;

let handleLeft = computed(() => {
  cellStore.getSvgBoundingRect();
  return svgUserToViewport(lineAttributes.value.p1x, lineAttributes.value.p1y).x - HANDLE_HALF;
});

let handleRight = computed(() => {
  cellStore.getSvgBoundingRect();
  return svgUserToViewport(lineAttributes.value.p2x, lineAttributes.value.p2y).x - HANDLE_HALF;
});

let handleTop = computed(() => {
  cellStore.getSvgBoundingRect();
  return svgUserToViewport(lineAttributes.value.p1x, lineAttributes.value.p1y).y - HANDLE_HALF;
});

let handleBottom = computed(() => {
  cellStore.getSvgBoundingRect();
  return svgUserToViewport(lineAttributes.value.p2x, lineAttributes.value.p2y).y - HANDLE_HALF;
});

function setInitialPosition(p: DotCoordinates) {
  const point = roundPoint(p);
  lineAttributes.value.p1x = point.x;
  lineAttributes.value.p2x = point.x;
  lineAttributes.value.p1y = point.y;
  lineAttributes.value.p2y = point.y;
  lineAttributes.value.arrowLeft = false;
  lineAttributes.value.arrowRight = false;
  lineAttributes.value.dashed = false;
  slopeType = "NONE";
  movementDirection = "NONE";
  lineColor.value = "black";
}

function drawLine(p: DotCoordinates) {
  const point = roundPoint(p);

  if (slopeType === "NONE") {
    slopeType = getSlopeTypeForNewLine(point.x, point.y);
  }

  if (movementDirection === "NONE") {
    movementDirection = getMovementDirection(point.y);
  }

  // 4 options for drawing sloped line:
  // 1. upper left to lower right. direction is DOWN and slopeType is NEGATIVE
  // 2  lower right to upper left. direction is UP and slopeType is NEGATIVE
  // 3. upper right to lower left. direction is DOWN and slopeType is POSITIVE
  // 4. lower left to upper right. direction is UP and slopeType is POSITIVE

  const aligned = alignToAxis(
    point,
    modifyRight.value
      ? { x: lineAttributes.value.p1x, y: lineAttributes.value.p1y }
      : { x: lineAttributes.value.p2x, y: lineAttributes.value.p2y },
  );

  if (modifyRight.value) {
    lineAttributes.value.p2x = aligned.x;
    lineAttributes.value.p2y = aligned.y;
  } else {
    lineAttributes.value.p1x = aligned.x;
    lineAttributes.value.p1y = aligned.y;
  }
}

function selectLine(notation: NotationAttributes) {
  activeJunction.value = null;
  const n = notation as LineNotationAttributes;

  slopeType = getSlopeTypeForExistingLine(n);

  lineAttributes.value.p1x = n.p1x;
  lineAttributes.value.p2x = n.p2x;
  lineAttributes.value.p1y = n.p1y;
  lineAttributes.value.p2y = n.p2y;
  lineAttributes.value.dashed = n.dashed;
  lineAttributes.value.arrowLeft = n.arrowLeft;
  lineAttributes.value.arrowRight = n.arrowRight;
  lineColor.value = n.color?.value ?? "black";
}

function junctionScreenLeft(junction: LineJunction) {
  cellStore.getSvgBoundingRect();
  return svgUserToViewport(junction.x, junction.y).x - HANDLE_HALF;
}

function junctionScreenTop(junction: LineJunction) {
  cellStore.getSvgBoundingRect();
  return svgUserToViewport(junction.x, junction.y).y - HANDLE_HALF;
}

function startJunctionEdit(junction: LineJunction) {
  activeJunction.value = junction;
}

function syncOverlayFromLine(line: LineNotationAttributes) {
  lineAttributes.value.p1x = line.p1x;
  lineAttributes.value.p2x = line.p2x;
  lineAttributes.value.p1y = line.p1y;
  lineAttributes.value.p2y = line.p2y;
}

function applyJunctionMove(junction: LineJunction, point: DotCoordinates) {
  const rounded = applyJunctionPoint(
    junction,
    point,
    (uuid) =>
      notationStore.getNotation(uuid) as LineNotationAttributes | undefined,
    (updatedLine) => {
      notationStore.addNotation(updatedLine, true, true);
      if (updatedLine.uuid === selectedLineUuid.value) {
        syncOverlayFromLine(updatedLine);
      }
    },
  );

  activeJunction.value = {
    ...junction,
    x: rounded.x,
    y: rounded.y,
  };
}

function modifyLineLeft(p: DotCoordinates) {
  if (activeJunction.value) {
    applyJunctionMove(activeJunction.value, p);
    return;
  }

  const point = roundPoint(p);
  movementDirection = getMovementDirection(point.x);

  lineAttributes.value.p1x = point.x;
  lineAttributes.value.p1y = point.y;
}

function modifyLineRight(p: DotCoordinates) {
  if (activeJunction.value) {
    applyJunctionMove(activeJunction.value, p);
    return;
  }

  const point = roundPoint(p);
  movementDirection = getMovementDirection(point.y);

  lineAttributes.value.p2x = point.x;
  lineAttributes.value.p2y = point.y;
}

function roundPoint(point: DotCoordinates): DotCoordinates {
  return {
    x: Math.round(point.x),
    y: Math.round(point.y),
  };
}

function getSlopeTypeForNewLine(xPos: number, yPos: number): SlopeType {
  if (
    /*moving up and right*/
    (yPos < lineAttributes.value.p2y && xPos > lineAttributes.value.p2x) ||
    /*moving down and left*/
    (yPos > lineAttributes.value.p2y && xPos < lineAttributes.value.p2x)
  ) {
    return "POSITIVE";
  }

  return "NEGATIVE";
}

function getSlopeTypeForExistingLine(line: LineAttributes): SlopeType {
  return line.p2y < line.p1y ? "POSITIVE" : "NEGATIVE";
}

function getMovementDirection(yPos: number): MovementDirection {
  return (slopeType === "POSITIVE" && yPos > lineAttributes.value.p2y) ||
    (slopeType === "NEGATIVE" && yPos > lineAttributes.value.p1y)
    ? "DOWN"
    : "UP";
}

function editNotStarted(): boolean {
  return (
    Math.abs(lineAttributes.value.p1x - lineAttributes.value.p2x) < 5 &&
    Math.abs(lineAttributes.value.p1y - lineAttributes.value.p2y) < 5
  );
}

async function endDrawing(): Promise<string> {
  if (editNotStarted()) {
    return "";
  }
  return await saveLine();
}

async function saveJunctionLines(
  junction: LineJunction,
  fixEdge: boolean,
): Promise<string> {
  let point: DotCoordinates = {
    x: junction.x,
    y: junction.y,
  };

  if (fixEdge) {
    point = getAdjustedEdge(point);
  }

  applyJunctionMove(junction, point);

  const lineUuids = collectJunctionLineUuids(junction);
  let firstUuid = lineUuids[0] ?? "";

  for (const lineUuid of lineUuids) {
    const line = notationStore.getNotation(lineUuid) as
      | LineNotationAttributes
      | undefined;
    if (!line) {
      continue;
    }
    await notationMutateHelper.updateLineNotation(line);
    firstUuid = lineUuid;
  }

  activeJunction.value = null;
  return firstUuid;
}

async function saveLine(fixEdge: boolean = true): Promise<string> {
  if (activeJunction.value) {
    return saveJunctionLines(activeJunction.value, fixEdge);
  }

  if (fixEdge) {
    straightenIfAxisAligned();
    const p1 = getAdjustedEdge({
      x: lineAttributes.value.p1x,
      y: lineAttributes.value.p1y,
    });
    lineAttributes.value.p1x = Math.round(p1.x);
    lineAttributes.value.p1y = Math.round(p1.y);
    straightenIfAxisAligned();
    const p2 = getAdjustedEdge({
      x: lineAttributes.value.p2x,
      y: lineAttributes.value.p2y,
    });
    lineAttributes.value.p2x = Math.round(p2.x);
    lineAttributes.value.p2y = Math.round(p2.y);
    straightenIfAxisAligned();
  }

  // flip p1x and p2x if p1x > p2x
  if (lineAttributes.value.p1x > lineAttributes.value.p2x) {
    const tempX = lineAttributes.value.p1x;
    const tempY = lineAttributes.value.p1y;
    lineAttributes.value.p1x = lineAttributes.value.p2x;
    lineAttributes.value.p1y = lineAttributes.value.p2y;
    lineAttributes.value.p2x = tempX;
    lineAttributes.value.p2y = tempY;
  }

  if (notationStore.getSelectedNotations().length > 0) {
    let updatedLine = {
      ...notationStore.getSelectedNotations().at(0)!,
      ...lineAttributes.value,
    };

    await notationMutateHelper.updateLineNotation(
      updatedLine as LineNotationAttributes,
    );
    return updatedLine.uuid;
  } else {
    return notationMutateHelper.addLineNotation(lineAttributes.value);
  }
}

function straightenIfAxisAligned() {
  const aligned = alignToAxis(
    { x: lineAttributes.value.p2x, y: lineAttributes.value.p2y },
    { x: lineAttributes.value.p1x, y: lineAttributes.value.p1y },
  );
  lineAttributes.value.p2x = aligned.x;
  lineAttributes.value.p2y = aligned.y;
}

function alignToAxis(
  point: DotCoordinates,
  anchor: DotCoordinates,
): DotCoordinates {
  const dx = Math.abs(point.x - anchor.x);
  const dy = Math.abs(point.y - anchor.y);
  const cellW = cellStore.getCellHorizontalWidth();
  const cellH = cellStore.getCellVerticalHeight();
  const yThreshold = Math.max(cellH * 0.5, 12);
  const xThreshold = Math.max(cellW * 0.5, 8);
  if (dx >= dy && dy <= yThreshold) {
    return { x: point.x, y: anchor.y };
  }
  if (dy >= dx && dx <= xThreshold) {
    return { x: anchor.x, y: point.y };
  }
  return point;
}

function getAdjustedEdge(point: DotCoordinates): DotCoordinates {
  // line edge at point
  const nearLineAtPoint = screenHelper.getNearestLineEdge(point);

  if (nearLineAtPoint != null) {
    return { x: nearLineAtPoint.x, y: nearLineAtPoint.y };
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

  const nearestCorner = screenHelper.getNearestGridCorner(point);
  if (nearestCorner != null) {
    return nearestCorner;
  }

  const cellW = cellStore.getCellHorizontalWidth();
  const cellH = cellStore.getCellVerticalHeight();
  const gx = Math.round(point.x / cellW) * cellW;
  const gy = Math.round(point.y / cellH) * cellH;
  return {
    x:
      Math.abs(gx - point.x) <= Math.max(8, cellW * 0.45)
        ? gx
        : Math.round(point.x),
    y:
      Math.abs(gy - point.y) <= Math.max(8, cellH * 0.45)
        ? gy
        : Math.round(point.y),
  };
}

function applyMoveToLine(dx: number, dy: number) {
  lineAttributes.value.p1y += dy;
  lineAttributes.value.p2y += dy;
  lineAttributes.value.p1x += dx;
  lineAttributes.value.p2x += dx;
}

function moveLine(moveX: number, moveY: number) {
  applyMoveToLine(moveX, moveY);
  saveLine();
}
</script>

<style scoped>
.line {
  stroke-width: 2px;
}

.dashed {
  stroke-dasharray: 5, 5;
}

/* Ensure markers scale properly with the line */
:deep(marker) {
  overflow: visible;
  stroke-width: inherit;
}
</style>
