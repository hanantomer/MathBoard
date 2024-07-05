<template>
  <div v-show="show">
    <v-card
      id="lineLeftHandle"
      class="lineHandle"
      v-bind:style="{
        // left: handleLeft + 'px',
        // top: handleTop + 'px',
      }"
      v-on:mouseup="onMouseUp"
      v-on:mousedown="onHandleMouseDown"
    ></v-card>
    <v-card
      id="lineRightHandle"
      class="lineHandle"
      v-bind:style="{
        // left: handleRight + 'px',
        // top: handleBottom + 'px',
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
      <path
        id="curve"
        d="M0 0"
        stroke="green"
        stroke-width="4"
        stroke-linecap="round"
        fill="transparent"
      ></path>
      <circle id="cp" cx="0" cy="0" r="4"></circle>
    </svg>
  </div>
</template>
<script setup lang="ts">
import useNotationMutateHelper from "../helpers/notationMutateHelper";

import { watch, computed, ref } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { DotPosition } from "../../../math-common/src/globals";
import {
  CurveAttributes,
  CurveNotationAttributes,
} from "../../../math-common/src/baseTypes";
import useEventBus from "../helpers/eventBusHelper";

const eventBus = useEventBus();
const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();

const MIN_NUMBER_OF_POINTS = 3;

type CurveType = "CONCAVE" | "CONVEX";

type Point = {
  x: number;
  y: number;
};

type PointWithSlope = {
  x: number;
  y: number;
  slope: number;
};

// props

const props = defineProps({
  svgId: { type: String, default: "" },
  curveType: { type: String, default: "CONCAVE" },
});

const show = computed(() => {
  return (
    editModeStore.isCurveDrawingMode() || editModeStore.isCurveSelectedMode()
  );
});

let p1x = 0;
let p1y = 0;
let p2x = 0;
let p2y = 0;
let cpx = 0;
let cpy = 0;

//let p2x = ref(0);
//let p2y = ref(0);

//let controlPoint1X = ref(0);
//let controlPoint1Y = ref(0);

let visitedPoints: Point[] = [];

let mouseMoveCount = 0;

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
  () => eventBus.bus.value.get("CURVE_SELECTED"), /// TODO: update emitter to distinguish line types
  (curve: CurveNotationAttributes) => {
    if (curve) onCurveSelected(curve);
  },
);

// event handlers

function onCurveSelected(curve: CurveNotationAttributes) {
  // linePosition.value.left.x =
  //   lineNotation.fromCol * (notationStore.getCellHorizontalWidth() + cellSpace);

  // linePosition.value.left.y =
  //   lineNotation.fromRow * (notationStore.getCellVerticalHeight() + cellSpace);

  // linePosition.value.right.x =
  //   lineNotation.toCol * (notationStore.getCellHorizontalWidth() + cellSpace);

  // linePosition.value.right.y =
  //   lineNotation.toRow * (notationStore.getCellVerticalHeight() + cellSpace);

  // notationStore.selectNotation(lineNotation.uuid);

  eventBus.emit("CURVE_SELECTED", null); // to enable re selection
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
  if (editModeStore.isCurveDrawingMode()) {
    resetCurveDrawing();
  }

  // new line
  if (editModeStore.isCurveStartedMode()) {
    startCurveDrawing({
      x: e.offsetX,
      y: e.offsetY,
    });
    editModeStore.setNextEditMode();
  }
}

function setCurve(xPos: number, yPos: number) {
  visitedPoints.push({ x: xPos, y: yPos }); // hold one y for each visited x

  if (visitedPoints.length < MIN_NUMBER_OF_POINTS) return;

  const points = getNormalizedPoints(visitedPoints);

  const slopes = getSlopes(points);

  const normalizedSlopes =
    props.curveType === "CONCAVE"
      ? getNormalizedConcaveSlopes(slopes)
      : getNormalizedConvexSlopes(slopes);

  console.debug("normalizedSlopes:");
  console.debug(normalizedSlopes);

  let controlPointIndex = getControlPointIndex(normalizedSlopes);
  console.debug("controlPointIndex:" + controlPointIndex);

  const theta = Math.atan2(yPos - p1y, xPos - p1x) - Math.PI / 2; // calculate rciprocal to curve
  const turningPoint = normalizedSlopes[controlPointIndex];

  const distanceFromCurve = calculateDistance(
    normalizedSlopes,
    controlPointIndex,
    props.curveType,
  );

  console.debug("distanceFromCurve" + distanceFromCurve);

  cpx = turningPoint.x + distanceFromCurve * Math.cos(theta);
  cpy = turningPoint.y + distanceFromCurve * Math.cos(theta);

  console.debug("p1x:" + p1x);
  console.debug("p1y:" + p1y);
  console.debug("xPos:" + xPos);
  console.debug("yPos:" + yPos);
  console.debug("cpX:" + cpx);
  console.debug("cpY:" + cpy);

  p2x = xPos;
  p2y = yPos;

  var curve =
    "M" + p1x + " " + p1y + " Q " + cpx + " " + cpy + " " + p2x + " " + p2y;

  // temporarly show control point
  var c1 = document.getElementById("cp");
  c1!.setAttribute("cx", cpx.toString());
  c1!.setAttribute("cy", cpy.toString());

  document.getElementById("curve")!.setAttribute("d", curve);
}

function onMouseMove(e: MouseEvent) {
  // ignore right button
  if (e.buttons !== 1) {
    return;
  }

  // nothing done yet
  if (p1x === 0 && p1y === 0) {
    return;
  }

  if (!editModeStore.isCurveDrawingMode()) {
    return;
  }

  mouseMoveCount++;
  if (mouseMoveCount % 5 !== 0) return; // throtteling mouse move events
  setCurve(e.offsetX, e.offsetY);
}

// verify that x can grow only
function getNormalizedPoints(points: Point[]) {
  const normalizedPoints = points;
  for (let i = 1; i < points.length; i++) {
    if (points[i].x <= points[i - 1].x) {
      points[i].x = points[i - 1].x + 1;
    }
  }
  return normalizedPoints;
}

function getSlopes(points: Point[]): PointWithSlope[] {
  const slopes: PointWithSlope[] = [];
  let prevPoint = { x: 0, y: 0 };
  for (let point of points) {
    if (prevPoint.x === 0) {
      slopes.push({ x: point.x, y: point.y, slope: 0 });
    } else {
      slopes.push({
        x: point.x,
        y: point.y,
        slope: (point.y - prevPoint.y) / (point.x - prevPoint.x),
      });
    }
    prevPoint = { x: point.x, y: point.y };
  }
  return slopes;
}

function getStdDev(arr: number[]) {
  const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
  return Math.sqrt(
    arr
      .reduce((acc: number[], val: number) => acc.concat((val - mean) ** 2), [])
      .reduce((acc: number, val: number) => acc + val, 0) / arr.length,
  );
}

function getControlPointIndex(
  normalizedPointsWithSlope: PointWithSlope[],
): number {
  let controlPointIndex: number = Math.round(
    normalizedPointsWithSlope.length / 2,
  );

  if (normalizedPointsWithSlope.length < MIN_NUMBER_OF_POINTS)
    return controlPointIndex;

  const slopes = normalizedPointsWithSlope.map((p) => p.slope);

  let minSumWeightedStd = 0;
  for (let i = 2; i < slopes.length - 2; i++) {
    //console.debug("i:" + i);

    const stdSlopes1 = getStdDev(slopes.slice(0, i));
    //console.debug("stdSlopes1:" + stdSlopes1);

    const stdSlopes2 = getStdDev(slopes.slice(i, slopes.length - 1));

    const sumWeightedStd =
      (stdSlopes1 * i + stdSlopes2 * (slopes.length - i)) / slopes.length;

    if (minSumWeightedStd === 0 || minSumWeightedStd > sumWeightedStd) {
      minSumWeightedStd = sumWeightedStd;
      controlPointIndex = i;
    }
  }
  return controlPointIndex;
}

function getNormalizedConvexSlopes(slopes: PointWithSlope[]): PointWithSlope[] {
  const normalizedSlopes: PointWithSlope[] = [];

  normalizedSlopes.push(slopes[0]);

  for (let i = 1; i < slopes.length - 1; i++) {
    normalizedSlopes.push(slopes[i]);
    let doNormalize = false;

    if (slopes[i].slope >= 0) {
      doNormalize = true;
    }

    // slopes are negative, verify it diminishes
    if (slopes[i].slope <= slopes[i - 1].slope && slopes[i - 1].slope !== 0) {
      doNormalize = true;
    }

    if (doNormalize) {
      normalizedSlopes[i].slope = slopes[i - 1].slope + 0.1;
    }
  }

  normalizedSlopes.push(slopes[slopes.length - 1]);

  return normalizedSlopes;
}

function getNormalizedConcaveSlopes(
  slopes: PointWithSlope[],
): PointWithSlope[] {
  const normalizedSlopes: PointWithSlope[] = [];

  normalizedSlopes.push(slopes[0]);

  for (let i = 1; i < slopes.length - 1; i++) {
    normalizedSlopes.push(slopes[i]);
    let doNormalize = false;

    if (slopes[i].slope >= 0) {
      doNormalize = true;
    }

    // slopes are negative, verify it increases
    if (slopes[i].slope >= slopes[i - 1].slope && slopes[i - 1].slope !== 0) {
      doNormalize = true;
    }

    if (doNormalize) {
      normalizedSlopes[i].slope = slopes[i - 1].slope - 0.1;
    }
  }

  normalizedSlopes.push(slopes[slopes.length - 1]);

  return normalizedSlopes;
}

function onMouseUp() {
  // drawing not started
  if (p1x === 0) {
    return;
  }

  // line yet not modified
  if (editModeStore.isCurveDrawingMode()) {
    endDrawCurve();
  }
}

function startCurveDrawing(position: DotPosition) {
  mouseMoveCount = 0;
  p1x = position.x;
  p1y = position.y;
}

function endDrawCurve() {
  if (p1x === p2x && p1y === p2y) return;

  saveCurve({
    p1x: p1x,
    p2x: p2x,
    p1y: p1y,
    p2y: p2y,
    cpx: cpx,
    cpy: cpy,
  });

  editModeStore.setDefaultEditMode();
}

function saveCurve(curevAttributes: CurveAttributes) {
  if (notationStore.getSelectedNotations().length > 0) {
    let updatedCurve = {
      ...notationStore.getSelectedNotations().at(0)!,
      ...curevAttributes,
    };

    notationMutateHelper.updateCurveNotation(
      updatedCurve as CurveNotationAttributes,
    );
  } else {
    notationMutateHelper.addCurveNotation(
      curevAttributes,
      editModeStore.getNotationTypeByEditMode(),
    );
  }
}

function calculateDistance(
  normalizedSlopes: PointWithSlope[],
  controlPointIndex: number,
  curveType: String,
): number {
  console.debug("calculateDistance");
  console.debug("controlPointIndex:" + controlPointIndex);
  console.debug("normalizedSlopes length:" + normalizedSlopes.length);

  const coeficient = curveType === "CONCAVE" ? -1 : 1;

  if (controlPointIndex === 0) {
    return 0;
  }

  if (normalizedSlopes.length <= 3) {
    return 0;
  }

  const avgSlopeUpToControlPoint =
    normalizedSlopes
      .slice(0, controlPointIndex + 1)
      .map((p) => p.slope)
      .reduce((a, b) => a + b) /
      controlPointIndex +
    1;

  const avgSlopeFromControlPoint =
    normalizedSlopes
      .slice(controlPointIndex + 1, normalizedSlopes.length)
      .map((p) => p.slope)
      .reduce((a, b) => a + b) /
      controlPointIndex +
    1;

  const slopeChange = Math.abs(
    avgSlopeFromControlPoint - avgSlopeUpToControlPoint,
  );

  console.debug("slopeChange:" + slopeChange);

  return slopeChange < 0.01
    ? 0
    : slopeChange < 0.25
    ? 5 * coeficient
    : slopeChange < 0.5
    ? 7 * coeficient
    : slopeChange < 1
    ? 9 * coeficient
    : 12 * coeficient;
}

function resetCurveDrawing() {
  p1x = p1y = 0;
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
