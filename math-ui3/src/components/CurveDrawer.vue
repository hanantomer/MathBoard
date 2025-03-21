<template>
  <div v-show="show">
    <svg
      id="curveSvgId"
      height="800"
      width="1500"
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
      <circle v-if="false"  id="controlPoint" cx="0" cy="0" r="4"></circle>
    </svg>
  </div>
</template>
<script setup lang="ts">
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useCurveHelper from "../helpers/curveHelper";

import { computed } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import {
  CurveAttributes,
  CurveNotationAttributes,
} from "../../../math-common/src/baseTypes";
import useWatchHelper from "../helpers/watchHelper";

const watchHelper = useWatchHelper();
const notationMutateHelper = useNotationMutateHelper();
const curveHelper = useCurveHelper();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const cellStore = useCellStore();

const show = computed(() => {
  return editModeStore.isCurveDrawingMode() || editModeStore.isCurveSelectedMode();
});

const curveType = computed(() => {
  return editModeStore.isConcaveCurveMode() ? "CONCAVE" : "CONVEX";
});

watchHelper.watchMouseEvent(
  ["CONVEX_CURVE_STARTED", "CONCAVE_CURVE_STARTED"],
  "EV_SVG_MOUSEDOWN",
  curveHelper.startCurveDrawing,
);

watchHelper.watchMouseEvent(
  ["CONCAVE_CURVE_DRAWING", "CONVEX_CURVE_DRAWING"],
  "EV_SVG_MOUSEMOVE",
  setCurve,
);

watchHelper.watchMouseEvent(
  ["CONCAVE_CURVE_DRAWING", "CONVEX_CURVE_DRAWING"],
  "EV_SVG_MOUSEUP",
  endDrawCurve,
);

// emmited by selection helper

watchHelper.watchNotationSelection(
  ["CONCAVE_CURVE_SELECTED"],
  "EV_CONCAVE_CURVE_SELECTED",
  curveSelected,
);

watchHelper.watchNotationSelection(
  ["CONVEX_CURVE_SELECTED"],
  "EV_CONVEX_CURVE_SELECTED",
  curveSelected,
);

watchHelper.watchMouseEvent(
  ["CONCAVE_CURVE_SELECTED", "CONVEX_CURVE_SELECTED"],
  "EV_SVG_MOUSEDOWN",
  endCurveDrawing,
);

watchHelper.watchMouseEvent(
  ["CONVEX_CURVE_SELECTED", "CONCAVE_CURVE_SELECTED"],
  "EV_SVG_MOUSEUP",
  () => editModeStore.setDefaultEditMode(),
);

// event handlers

function curveSelected(curve: CurveNotationAttributes) {
  notationStore.selectNotation(curve.uuid);
}

function setCurve(e: MouseEvent) {
  if (e.buttons !== 1) return;
  const xPos = e.pageX - cellStore.getSvgBoundingRect().x;
  const yPos = e.pageY - cellStore.getSvgBoundingRect().y;

  const curveAttributes: CurveAttributes = curveHelper.updateCurve(
    curveType.value,
    xPos,
    yPos,
  );

  if (!curveAttributes) return;

  setCurveElement(curveAttributes);

  // temporarly show control point
  showControlPoint(curveAttributes);
}

function showControlPoint(curveAttributes: CurveAttributes) {
  var c1 = document.getElementById("controlPoint");
  c1!.setAttribute("cx", curveAttributes.cpx.toString());
  c1!.setAttribute("cy", curveAttributes.cpy.toString());
}

function setCurveElement(curveAttributes: CurveAttributes) {
  var curve =
    "M" +
    curveAttributes.p1x +
    " " +
    curveAttributes.p1y +
    " Q " +
    curveAttributes.cpx +
    " " +
    curveAttributes.cpy +
    " " +
    curveAttributes.p2x +
    " " +
    curveAttributes.p2y;

  document.getElementById("curve")!.setAttribute("d", curve);
}

function endDrawCurve() {
  const curveAttributes: CurveAttributes = curveHelper.getCurveAttributes()!;

  // drawing not started
  if (curveAttributes.p1x === 0) {
    return;
  }

  if (
    curveAttributes.p1x === curveAttributes.p2x &&
    curveAttributes.p1y === curveAttributes.p2y
  )
    return;

  saveCurve({
    p1x: curveAttributes.p1x,
    p2x: curveAttributes.p2x,
    p1y: curveAttributes.p1y,
    p2y: curveAttributes.p2y,
    cpx: curveAttributes.cpx,
    cpy: curveAttributes.cpy,
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

function endCurveDrawing() {
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

.curveControlPoint {
  fill: aqua;
}

.elipsisControlPoint {
  fill: yellow;
}
</style>
