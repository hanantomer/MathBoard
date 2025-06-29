<template>
  <lineWatcher
    :startEntry="{
      editMode: ['CURVE_STARTED'],
      func: startCurveDrawing,
    }"
    :drawEntry="{
      editMode: ['CURVE_DRAWING'],
      func: setCurve,
    }"
    :editEntryFirstHandle="{
      editMode: ['CURVE_EDITING_LEFT'],
      func: setCurveLeft,
    }"
    :editEntrySecondHandle="{
      editMode: ['CURVE_EDITING_RIGHT'],
      func: setCurveRight,
    }"
    :endEntry="{
      editMode: [
        'CURVE_DRAWING',
        'CURVE_EDITING_RIGHT',
        'CURVE_EDITING_LEFT',
        'CURVE_EDITING_CONTROLֹ_POINT',
        'CURVE_SELECTED',
      ],
      func: endDrawCurve,
    }"
    :selectEntry="{
      editMode: ['CURVE_SELECTED'],
      func: selectCurve,
      event: 'EV_CURVE_SELECTED',
    }"
    :moveByKeyEntry="{
      editMode: ['CURVE_SELECTED'],
      func: moveCurve,
    }"
    :endSelectionEntry="{
      editMode: ['CURVE_SELECTED'],
    }"
  ></lineWatcher>

  <div v-show="show">
    <line-handle
      drawing-mode="CURVE_DRAWING"
      editing-mode="CURVE_EDITING_LEFT"
      v-bind:style="{
        left: handleX1 + 'px',
        top: handleY1 + 'px',
      }"
    ></line-handle>
    <line-handle
      drawing-mode="CURVE_DRAWING"
      editing-mode="CURVE_EDITING_RIGHT"
      v-bind:style="{
        left: handleX2 + 'px',
        top: handleY2 + 'px',
      }"
    ></line-handle>

    <svg
      id="curveSvgId"
      height="800"
      width="1500"
      class="line-svg"
      xmlns="http://www.w3.org/2000/svg"
      style="position: absolute; pointer-events: none"
    >
      <path
        class="line"
        id="curve"
        d="M0 0"
        stroke-linecap="round"
        fill="transparent"
      ></path>
      <circle
        id="controlPoint"
        cx="0"
        cy="0"
        r="8"
        style="position: absolute; pointer-events: painted"
      ></circle>
    </svg>
  </div>
</template>
<script setup lang="ts">
import lineHandle from "./LineHandle.vue";
import lineWatcher from "./LineWatcher.vue";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useWatchHelper from "../helpers/watchHelper";
import useEventBus from "../helpers/eventBusHelper";
import { computed, ref, onMounted } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import {
  CurveAttributes,
  NotationAttributes,
  CurveNotationAttributes,
  DotCoordinates,
} from "../../../math-common/src/baseTypes";

import { useCellStore } from "../store/pinia/cellStore";
import useSelectionHelper from "../helpers/selectionHelper";
const cellStore = useCellStore();

const MIN_NUMBER_OF_POINTS = 6;
const MOUSE_MOVE_THROTTELING_INTERVAL = 2;

const notationMutateHelper = useNotationMutateHelper();
const watchHelper = useWatchHelper();
const eventBus = useEventBus();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const visitedPointPrefix = "visitedPoint";
const selectionHelper = useSelectionHelper();

type Point = {
  x: number;
  y: number;
};

type PointWithSlope = {
  x: number;
  y: number;
  slope: number;
};

type CurveType = "CONCAVE" | "CONVEX" | undefined;

let curveType: CurveType = undefined;

let visitedPoints: Point[] = [];

let mouseMoveCount = 0;

const curveAttributes = ref<CurveAttributes>({
  p1x: 0,
  p1y: 0,
  p2x: 0,
  p2y: 0,
  cpx: 0,
  cpy: 0,
});

onMounted(() => {
  setTimeout(() => {
    const controlPoint = document.getElementById("controlPoint");
    if (controlPoint) {
      controlPoint.addEventListener("mousedown", () => {
        if (!editModeStore.isCurveEditingControlPointMode()) {
          editModeStore.setEditMode("CURVE_EDITING_CONTROLֹ_POINT");
        }
      });
      controlPoint.addEventListener("mouseup", (e) => {
        eventBus.emit("EV_SVG_MOUSEUP", e);
      });
    }
  });
  // const controlPoint = document.getElementById("curveSvgId");
  // if (controlPoint) {
  //   controlPoint.addEventListener("mousemove", () => {
  //     editModeStore.setEditMode("CURVE_EDITING_CONTROLֹ_POINT");
  //   });
  // }
});

const handleX1 = computed(() => {
  return curveAttributes.value.p1x + cellStore.getSvgBoundingRect().left;
});

const handleY1 = computed(() => {
  return curveAttributes.value.p1y + cellStore.getSvgBoundingRect().top;
});

const handleX2 = computed(() => {
  return curveAttributes.value.p2x + cellStore.getSvgBoundingRect().left;
});

const handleY2 = computed(() => {
  return curveAttributes.value.p2y + cellStore.getSvgBoundingRect().top;
});

const show = computed(() => {
  return (
    editModeStore.isCurveDrawingMode() || editModeStore.isCurveSelectedMode()
  );
});

watchHelper.watchMouseEvent(
  ["CURVE_EDITING_CONTROLֹ_POINT"],
  "EV_SVG_MOUSEMOVE",
  setControlPoint,
);

function getCurveType() {
  const slopes = getSlopes(visitedPoints);

  console.debug("slopes:" + JSON.stringify(slopes));

  if (slopes.length < 5) {
    return undefined; // cannot determine curve type
  }

  const curveType =
    slopes[0].slope < slopes[slopes.length - 1].slope ? "CONCAVE" : "CONVEX";

  console.debug("curveType:" + curveType);

  return curveType;
}

function initCurve() {
  curveType = undefined;
  visitedPoints = [];
  curveAttributes.value = {
    p1x: 0,
    p1y: 0,
    p2x: 0,
    p2y: 0,
    cpx: 0,
    cpy: 0,
  };
}

function setCurveLeft(p: DotCoordinates) {
  curveAttributes.value.p1x = p.x;
  curveAttributes.value.p1y = p.y;
  setCurveElement();
}

function setCurveRight(p: DotCoordinates) {
  curveAttributes.value.p2x = p.x;
  curveAttributes.value.p2y = p.y;
  setCurveElement();
}

function startCurveDrawing(p: DotCoordinates) {
  removeVisiblePoints();

  initCurve();

  visitedPoints = [];
  mouseMoveCount = 0;
  if (curveAttributes) {
    curveAttributes.value.p1x =
      curveAttributes.value.p2x =
      curveAttributes.value.cpx =
        p.x;
    curveAttributes.value.p1y =
      curveAttributes.value.p2y =
      curveAttributes.value.cpy =
        p.y;
  }
}

function selectCurve(curve: NotationAttributes) {
  const c = curve as CurveNotationAttributes;
  visitedPoints = [];
  curveAttributes.value.p1x = c.p1x;
  curveAttributes.value.p1y = c.p1y;
  curveAttributes.value.p2x = c.p2x;
  curveAttributes.value.p2y = c.p2y;
  curveAttributes.value.cpx = c.cpx;
  curveAttributes.value.cpy = c.cpy;
  setCurveElement();
  showControlPoint();
}

function setControlPoint(e: MouseEvent) {
  curveAttributes.value.cpx = e.offsetX;
  curveAttributes.value.cpy = e.offsetY;
  setCurveElement();
  showControlPoint();
}

function setCurve(p: DotCoordinates) {
  if (!curveType || curveType === undefined) {
    curveType = getCurveType();
  }

  updateCurve(curveType, p.x, p.y);

  if (!curveAttributes) return;

  setCurveElement();

  // temporarly show control point
  showControlPoint();
}

function moveCurve(moveX: number, moveY: number) {
  if (curveAttributes.value.p1x === 0 && curveAttributes.value.p1y === 0) {
    return;
  }

  curveAttributes.value.p1x += moveX;
  curveAttributes.value.p1y += moveY;

  curveAttributes.value.p2x += moveX;
  curveAttributes.value.p2y += moveY;

  setCurveElement();

  saveCurve(curveAttributes.value);
}

function showControlPoint() {
  var c1 = document.getElementById("controlPoint");
  c1!.setAttribute("cx", curveAttributes.value.cpx.toString());
  c1!.setAttribute("cy", curveAttributes.value.cpy.toString());
}

function setCurveElement() {
  var curve =
    "M" +
    curveAttributes.value.p1x +
    " " +
    curveAttributes.value.p1y +
    " Q " +
    curveAttributes.value.cpx +
    " " +
    curveAttributes.value.cpy +
    " " +
    curveAttributes.value.p2x +
    " " +
    curveAttributes.value.p2y;

  document.getElementById("curve")!.setAttribute("d", curve);
}

function endDrawCurve() {
  // drawing not started
  if (curveAttributes.value.p1x === 0) {
    return;
  }

  // drawing not finished
  if (
    curveAttributes.value.p1x === curveAttributes.value.p2x &&
    curveAttributes.value.p1y === curveAttributes.value.p2y
  ) {
    return;
  }

  saveCurve({
    p1x: curveAttributes.value.p1x,
    p2x: curveAttributes.value.p2x,
    p1y: curveAttributes.value.p1y,
    p2y: curveAttributes.value.p2y,
    cpx: curveAttributes.value.cpx,
    cpy: curveAttributes.value.cpy,
  });
  editModeStore.setDefaultEditMode();
}

async function saveCurve(curevAttributes: CurveAttributes) {
  if (notationStore.getSelectedNotations().length > 0) {
    let updatedCurve = {
      ...notationStore.getSelectedNotations().at(0)!,
      ...curevAttributes,
    };

    notationMutateHelper.updateCurveNotation(
      updatedCurve as CurveNotationAttributes,
    );
  } else {
    const uuid =  await notationMutateHelper.addCurveNotation(
      curevAttributes
    );
    selectionHelper.selectCurveNotation(uuid);
  }
}

function calculateControlPointDistance(
  leftPoint: Point,
  centerPoint: Point,
  rightPoint: Point,
  curveType: String,
): number {
  const coefficient = curveType === "CONCAVE" ? -1 : 1;

  const ac = Math.sqrt(
    Math.pow(centerPoint.x - leftPoint.x, 2) +
      Math.pow(centerPoint.y - leftPoint.y, 2),
  );

  const bc = Math.sqrt(
    Math.pow(centerPoint.x - rightPoint.x, 2) +
      Math.pow(centerPoint.y - rightPoint.y, 2),
  );

  const ab = Math.sqrt(
    Math.pow(leftPoint.x - rightPoint.x, 2) +
      Math.pow(leftPoint.y - rightPoint.y, 2),
  );

  const cosineGama =
    (Math.pow(ac, 2) + Math.pow(bc, 2) - Math.pow(ab, 2)) / (2 * ac * bc);

  return (1 - cosineGama * -1) * 550 * coefficient;
}

function getSlopes(points: Point[]): PointWithSlope[] {
  const slopes: PointWithSlope[] = [];
  let prevPoint = { x: 0, y: 0 };
  for (let point of points) {
    if (prevPoint.x != 0) {
      slopes.push({
        x: point.x,
        y: point.y,
        slope: (prevPoint.y - point.y) / (point.x - prevPoint.x),
      });
    }
    prevPoint = { x: point.x, y: point.y };
  }

  //setSlopesMovingAverage(slopes);

  return slopes;
}

function setSlopesMovingAverage(slopes: PointWithSlope[]) {
  const windowSize = 3;
  for (let i = 0; i < slopes.length; i++) {
    let sum = 0;
    let count = 0;
    for (
      let j = Math.max(0, i - windowSize);
      j <= Math.min(slopes.length - 1, i + windowSize);
      j++
    ) {
      sum += slopes[j].slope;
      count++;
    }
    slopes[i].slope = sum / count;
  }
}

function xIsGrowingOrEqual(xPos: number): boolean {
  if (xPos > visitedPoints[visitedPoints.length - 1].x) return true;
  return false;
}

function setCurvePoints(xPos: number, yPos: number): boolean {
  // nothing done yet
  if (curveAttributes.value.p1x === 0 && curveAttributes.value.p1y === 0) {
    console.debug("not initialized");
    return false;
  }

  mouseMoveCount++;
  if (mouseMoveCount % MOUSE_MOVE_THROTTELING_INTERVAL !== 0) {
    //console.debug("throtteling:" + mouseMoveCount);
    return false; // throtteling mouse move events
  }

  if (visitedPoints.length > 0 && !xIsGrowingOrEqual(xPos)) {
    //      console.debug("x is not growing");
    return false;
  }

  //console.debug("point added:" + visitedPoints.length);
  visitedPoints.push({ x: xPos, y: yPos });

  return true;
}

function setCurveAttributes(curveType: CurveType, xPos: number, yPos: number) {
  if (visitedPoints.length < MIN_NUMBER_OF_POINTS) {
    return;
  }

  const points = getSlopes(visitedPoints);

  if (points.length < MIN_NUMBER_OF_POINTS) {
    return;
  }

  //https://stackoverflow.com/questions/49274176/how-to-create-a-curved-svg-path-between-two-points

  const theta =
    Math.atan2(
      yPos - curveAttributes.value.p1y,
      xPos - curveAttributes.value.p1x,
    ) -
    Math.PI / 2; // calculate rciprocal to curve

  const leftPoint = points[0];

  const centerPoint = points[Math.round(points.length / 2)];

  const rightPoint = points[points.length - 1];

  let distanceFromCurve = calculateControlPointDistance(
    leftPoint,
    centerPoint,
    rightPoint,
    curveType!,
  );

  curveAttributes.value.cpx =
    centerPoint.x + Math.round(Math.cos(theta) * distanceFromCurve);
  curveAttributes.value.cpy =
    centerPoint.y + Math.round(Math.sin(theta) * distanceFromCurve);

  curveAttributes.value.p2x = xPos;
  curveAttributes.value.p2y = yPos;
}

function updateCurve(curveType: CurveType, xPos: number, yPos: number): void {
  removePointsToTheRightOfX(xPos);

  setCurvePoints(xPos, yPos);

  setCurveAttributes(curveType, xPos, yPos);
}

function removePointsToTheRightOfX(xPos: number) {
  visitedPoints = visitedPoints.filter((p) => p.x <= xPos);
}

function removeVisiblePoints() {
  const visitedPointsCircleElements = document.querySelectorAll(
    `[id^=${visitedPointPrefix}]`,
  );
  visitedPointsCircleElements.forEach((vp) => vp.parentNode?.removeChild(vp));
}

function addVisiblePoint(xPos: number, yPos: number) {
  //return;
  let svgns = "http://www.w3.org/2000/svg";
  let svgContainer = document.getElementById("curveSvgId")!;
  //    let visitedPoints = curveHelper.getVisitedPoints();

  //for (let i = 0; i < visitedPoints.length; i++) {
  const id = visitedPointPrefix + xPos + yPos;
  let circle = document.createElementNS(svgns, "circle");
  circle.setAttribute("id", id);
  //circle.setAttributeNS(null, "cx", visitedPoints[i].x.toString());
  //circle.setAttributeNS(null, "cy", visitedPoints[i].y.toString());
  circle.setAttributeNS(null, "cx", xPos.toString());
  circle.setAttributeNS(null, "cy", yPos.toString());

  circle.setAttributeNS(null, "r", "3");
  circle.setAttributeNS(
    null,
    "style",
    "fill: none; stroke: blue; stroke-width: 1px;",
  );
  svgContainer.appendChild(circle);
  //}
}
</script>

<style>
.curveControlPoint {
  fill: aqua;
}

.elipsisControlPoint {
  fill: yellow;
}
</style>
