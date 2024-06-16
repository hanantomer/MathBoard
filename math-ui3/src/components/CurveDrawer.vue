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
    </svg>
  </div>
</template>
<script setup lang="ts">
import useNotationMutateHelper from "../helpers/notationMutateHelper";

import { watch, computed, ref, PropType } from "vue";
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

type CurveType = "CONCAVE" | "CONVEX";

// props

const props = defineProps({
  svgId: { type: String, default: "" },
  curveType: { type: Object as PropType<CurveType>, default: "CONCAVE" },
});

const show = computed(() => {
  return (
    editModeStore.isCurveDrawingMode() || editModeStore.isCurveSelectedMode()
  );
});

let p1x = ref(0);
let p1y = ref(0);

let p2x = ref(0);
let p2y = ref(0);

let controlPoint1X = ref(0);
let controlPoint1Y = ref(0);
let controlPoint2X = ref(0);
let controlPoint2Y = ref(0);

let visitedPoints = new Map<number, number>();

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
  visitedPoints.set(xPos, yPos); // hold one y for each visited x

  const slopes = getSlopes();
  const normalizedSlopes = getNormalizedSlopes(slopes);
  setControlPoints(normalizedSlopes);

  p2x.value = xPos;
  p2y.value = yPos;
}

function onMouseMove(e: MouseEvent) {
  // ignore right button
  if (e.buttons !== 1) {
    return;
  }

  // nothing done yet
  if (
    p1x.value === 0 &&
    p1y.value === 0 &&
    p2x.value === 0 &&
    p2y.value === 0
  ) {
    return;
  }

  if (!editModeStore.isCurveDrawingMode()) {
    return;
  }

  mouseMoveCount++;
  if (mouseMoveCount % 5 !== 0) return;  // throtteling mouse move events
  setCurve(e.offsetX, e.offsetY);
}

// 2 control points: one from the most left x to the point where sginificant
// change in slope occured. the second is from previous point to the most right x
// the optimim point is that which produces 2 segments  with minimized slope variance
// in order to minimize noise we sample only 1 of 5 mouse move events
// also, we detect outliers by identifying if the slope direction differs from 2 sides.
function getSlopes() : number[] {

  const slopes = [];
  let prevPoint = { x: 0, y: 0 };
  for (let [x, y] of visitedPoints) {
    if (prevPoint.x === 0) {
      slopes.push(0);
    } else {
      slopes.push(y - prevPoint.y / x - prevPoint.x);
    }
    prevPoint = { x: x, y: y };
  }
  return slopes;
}

function setControlPoints(normalizedSlopes: number[]) {
  let minSlopePosition = 0;
  let minSlopesDiffSum = 0;
  for (let i = 0; i < normalizedSlopes.length; i++) {
    let sumSlopesDiff1 = 0;
    let sumSlopesDiff2 = 0;
    for (let j = 1; j < i; j++) {
      sumSlopesDiff1 +=
        Math.abs(normalizedSlopes[j]) - Math.abs(normalizedSlopes[j - 1]);
    }

    for (let j = i ; j < normalizedSlopes.length; j++) {
      sumSlopesDiff2 +=
        Math.abs(normalizedSlopes[j]) - Math.abs(normalizedSlopes[j - 1]);
    }

    if (minSlopesDiffSum === 0 || sumSlopesDiff1 + sumSlopesDiff2 < minSlopesDiffSum) {
      minSlopesDiffSum = sumSlopesDiff1 + sumSlopesDiff2;
      minSlopePosition = i;
    }
  }


  // set y left top of curv if concave else right bottom
  controlPoint1X.value = 0;
  controlPoint1Y.value = 0;
  controlPoint2X.value = 0;
  controlPoint2Y.value = 0;



}

function getNormalizedSlopes(slopes: number[]) : number[] {
  const normalizedSlopes: number[] = [];

  for (let i = 1; i < slopes.length - 1; i++) {
    let doNormalize = false;
    if (slopes[i] < 0 && slopes[i - 1] > 0 && slopes[i + 1] > 0) {
      doNormalize = true;
    }

    if (slopes[i] > 0 && slopes[i - 1] < 0 && slopes[i + 1] < 0) {
      doNormalize = true;
    }

    if (doNormalize) {
      slopes[i] = (slopes[i - 1] + slopes[i + 1]) / 2;
    }
  }

  return normalizedSlopes;
}

function onMouseUp() {
  // drawing not started
  // if (
  //   linePosition.value.left.x === 0 &&
  //   linePosition.value.left.y === 0 &&
  //   linePosition.value.right.x === 0 &&
  //   linePosition.value.right.y === 0
  // ) {
  //   return;
  // }

  // line yet not modified
  if (editModeStore.isSlopeLineDrawingMode()) {
    endDrawLine();
  }
}

// methods

function svgDimensions(): DOMRect | undefined {
  return document.getElementById(props.svgId)?.getBoundingClientRect();
}

function startCurveDrawing(position: DotPosition) {
  mouseMoveCount = 0;
  p1x.value = p2x.value = position.x;
  p1y.value = p2y.value = position.y;
}

function endDrawLine() {
  // if (
  //   linePosition.value.left.x == linePosition.value.right.x &&
  //   linePosition.value.right.y == linePosition.value.right.y
  // )
  //   return;

  // let fromCol = Math.round(
  //   linePosition.value.left.x /
  //     (notationStore.getCellHorizontalWidth() + cellSpace),
  // );

  // let toCol = Math.round(
  //   linePosition.value.right.x /
  //     (notationStore.getCellHorizontalWidth() + cellSpace),
  // );

  // let fromRow = Math.round(
  //   linePosition.value.left.y /
  //     (notationStore.getCellVerticalHeight() + cellSpace),
  // );

  // let toRow = Math.round(
  //   linePosition.value.right.y /
  //     (notationStore.getCellVerticalHeight() + cellSpace),
  // );

  // saveLine({
  //   fromCol: fromCol,
  //   toCol: toCol,
  //   fromRow: fromRow,
  //   toRow: toRow,
  // });

  editModeStore.setDefaultEditMode();
}

function saveCiurve(curevAttributes: CurveAttributes) {
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

function resetCurveDrawing() {
  p1x.value = p1y.value = p2x.value = p2y.value = 0;
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
