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
    :saveEntry="{
      editMode: [
        'CURVE_DRAWING',
        'CURVE_EDITING_RIGHT',
        'CURVE_EDITING_LEFT',
        'CURVE_EDITING_CONTROLֹ_POINT',
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
    :endEntry="{
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
      :style="lineSvgScreenStyle"
      class="line-svg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        class="line"
        id="curve"
        d="M0 0"
        stroke-linecap="round"
        fill="transparent"
        stroke="black"
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
import { svgPointerPosition } from "../helpers/pointerCoordinateHelper";
import useEventBus from "../helpers/eventBusHelper";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import {
  CurveAttributes,
  NotationAttributes,
  CurveNotationAttributes,
  DotCoordinates,
} from "common/baseTypes";

import { useCellStore } from "../store/pinia/cellStore";
import { matrixSize } from "common/globals";
import useScreenHelper from "../helpers/screenHelper";

const cellStore = useCellStore();
const screenHelper = useScreenHelper();

const MIN_NUMBER_OF_POINTS = 6;
const MOUSE_MOVE_THROTTELING_INTERVAL = 2;
const MIN_VISITED_POINT_DISTANCE = 4;
const DEGENERATE_CONTROL_DISTANCE = 3;

const notationMutateHelper = useNotationMutateHelper();
const watchHelper = useWatchHelper();
const eventBus = useEventBus();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const visitedPointPrefix = "visitedPoint";

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
      const startControl = (e: PointerEvent) => {
        e.preventDefault();
        if (!editModeStore.isCurveEditingControlPointMode()) {
          editModeStore.setEditMode("CURVE_EDITING_CONTROLֹ_POINT");
        }
        const id = cellStore.getSvgId();
        const svg = id ? document.getElementById(id) : null;
        if (svg && e.pointerId != null) {
          try {
            svg.setPointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
        }
      };
      const endControl = (e: PointerEvent) => {
        eventBus.emit("EV_SVG_POINTERUP", e);
      };
      controlPoint.addEventListener("pointerdown", startControl);
      controlPoint.addEventListener("pointerup", endControl);
      controlPoint.addEventListener("pointercancel", endControl);
    }
  });
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

watch(show, async (visible) => {
  if (visible) {
    await nextTick();
    const id = cellStore.getSvgId();
    if (id) {
      cellStore.setSvgBoundingRect(id);
    }
  }
});

/** Same viewport origin as pointer math and handles; avoids margin/layout drift from `.mathboard` on an `absolute` overlay. */
const lineSvgScreenStyle = computed(() => {
  const r = cellStore.getSvgBoundingRect();
  return {
    position: "fixed" as const,
    top: `${r.top}px`,
    left: `${r.left}px`,
    width: matrixSize.width,
    height: matrixSize.height,
    margin: "0",
    pointerEvents: "none" as const,
  };
});

watchHelper.watchPointerEvent(
  ["CURVE_EDITING_CONTROLֹ_POINT"],
  ["EV_SVG_POINTERMOVE"],
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

function snapPoint(point: DotCoordinates): DotCoordinates {
  return screenHelper.snapCurvePoint(point);
}

function setCurveLeft(p: DotCoordinates) {
  const point = snapPoint(p);
  curveAttributes.value.p1x = point.x;
  curveAttributes.value.p1y = point.y;
  setCurveElement();
}

function setCurveRight(p: DotCoordinates) {
  const point = snapPoint(p);
  curveAttributes.value.p2x = point.x;
  curveAttributes.value.p2y = point.y;
  setCurveElement();
}

function startCurveDrawing(p: DotCoordinates) {
  startCurveFromPoint(p);
}

function startCurveFromPoint(p: DotCoordinates) {
  const point = snapPoint(p);
  removeVisiblePoints();

  visitedPoints = [{ x: point.x, y: point.y }];
  mouseMoveCount = 0;
  curveType = undefined;
  curveAttributes.value.p1x =
    curveAttributes.value.p2x =
    curveAttributes.value.cpx =
      point.x;
  curveAttributes.value.p1y =
    curveAttributes.value.p2y =
    curveAttributes.value.cpy =
      point.y;
  setCurveElement();
}

function isDegenerateControl(attrs: CurveAttributes): boolean {
  const { p1x, p1y, p2x, p2y, cpx, cpy } = attrs;
  if (p1x === p2x && p1y === p2y) {
    return true;
  }
  const nearStart = Math.hypot(cpx - p1x, cpy - p1y) <= DEGENERATE_CONTROL_DISTANCE;
  const nearEnd = Math.hypot(cpx - p2x, cpy - p2y) <= DEGENERATE_CONTROL_DISTANCE;
  return nearStart || nearEnd;
}

function defaultControlPoint(
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
): { cpx: number; cpy: number } {
  const mx = (p1x + p2x) / 2;
  const my = (p1y + p2y) / 2;
  const dx = p2x - p1x;
  const dy = p2y - p1y;
  const len = Math.hypot(dx, dy) || 1;
  const offset = Math.max(30, len * 0.35);
  return {
    cpx: Math.round(mx - (dy / len) * offset),
    cpy: Math.round(my + (dx / len) * offset),
  };
}

function ensureCurveControlPoint(attrs: CurveAttributes): CurveAttributes {
  if (!isDegenerateControl(attrs)) {
    return attrs;
  }
  const cp = defaultControlPoint(attrs.p1x, attrs.p1y, attrs.p2x, attrs.p2y);
  return { ...attrs, cpx: cp.cpx, cpy: cp.cpy };
}

async function selectCurve(curve: NotationAttributes) {
  const c = curve as CurveNotationAttributes;
  visitedPoints = [];
  const loaded = ensureCurveControlPoint({
    p1x: c.p1x,
    p1y: c.p1y,
    p2x: c.p2x,
    p2y: c.p2y,
    cpx: c.cpx,
    cpy: c.cpy,
  });
  curveAttributes.value = { ...loaded };
  await nextTick();
  const id = cellStore.getSvgId();
  if (id) {
    cellStore.setSvgBoundingRect(id);
  }
  setCurveElement();
  showControlPoint();
}

function setControlPoint(e: PointerEvent) {
  const p = svgPointerPosition(e);
  curveAttributes.value.cpx = Math.round(p.x);
  curveAttributes.value.cpy = Math.round(p.y);
  setCurveElement();
  showControlPoint();
}

function setCurve(p: DotCoordinates) {
  if (!curveType || curveType === undefined) {
    curveType = getCurveType();
  }

  const point = snapPoint(p);
  updateCurve(curveType, point.x, point.y);

  if (!curveAttributes) return;

  if (isDegenerateControl(curveAttributes.value)) {
    const fixed = ensureCurveControlPoint(curveAttributes.value);
    curveAttributes.value.cpx = fixed.cpx;
    curveAttributes.value.cpy = fixed.cpy;
  }

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
  curveAttributes.value.cpx += moveX;
  curveAttributes.value.cpy += moveY;

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

async function endDrawCurve(): Promise<string> {
  // drawing not started
  if (curveAttributes.value.p1x === 0 && curveAttributes.value.p1y === 0) {
    return "";
  }

  // tap without drag — end a continue chain or cancel a new stroke
  if (
    curveAttributes.value.p1x === curveAttributes.value.p2x &&
    curveAttributes.value.p1y === curveAttributes.value.p2y
  ) {
    editModeStore.setEditMode("CURVE_STARTED");
    return "";
  }

  const start = snapPoint({
    x: curveAttributes.value.p1x,
    y: curveAttributes.value.p1y,
  });
  const end = snapPoint({
    x: curveAttributes.value.p2x,
    y: curveAttributes.value.p2y,
  });
  const savedCurve = ensureCurveControlPoint({
    p1x: start.x,
    p1y: start.y,
    p2x: end.x,
    p2y: end.y,
    cpx: Math.round(curveAttributes.value.cpx),
    cpy: Math.round(curveAttributes.value.cpy),
  });
  curveAttributes.value.cpx = savedCurve.cpx;
  curveAttributes.value.cpy = savedCurve.cpy;

  const isUpdate = notationStore.getSelectedNotations().length > 0;
  const uuid = await saveCurve(savedCurve);

  if (!isUpdate && uuid) {
    notationStore.resetSelectedNotations();
    startCurveFromPoint(end);
    editModeStore.setEditMode("CURVE_DRAWING");
    return uuid;
  }

  editModeStore.setEditMode("CURVE_SELECTED");
  return uuid;
}

async function saveCurve(curevAttributes: CurveAttributes): Promise<string> {
  if (notationStore.getSelectedNotations().length > 0) {
    let updatedCurve = {
      ...notationStore.getSelectedNotations().at(0)!,
      ...curevAttributes,
    };

    notationMutateHelper.updateCurveNotation(
      updatedCurve as CurveNotationAttributes,
    );
    return updatedCurve.uuid;
  } else {
    return await notationMutateHelper.addCurveNotation(curevAttributes);
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

function shouldAddVisitedPoint(xPos: number, yPos: number): boolean {
  if (visitedPoints.length === 0) {
    return true;
  }
  const last = visitedPoints[visitedPoints.length - 1];
  return (
    Math.hypot(xPos - last.x, yPos - last.y) >= MIN_VISITED_POINT_DISTANCE
  );
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

  if (!shouldAddVisitedPoint(xPos, yPos)) {
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
