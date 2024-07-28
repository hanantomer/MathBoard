<template>
  <div v-show="show">
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
import useCurveHelper from "../helpers/curveHelper";

import { watch, computed } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { DotCoordinates } from "../../../math-common/src/baseTypes";
import {
  CurveAttributes,
  CurveNotationAttributes,
} from "../../../math-common/src/baseTypes";
import useEventBus from "../helpers/eventBusHelper";

const eventBus = useEventBus();
const notationMutateHelper = useNotationMutateHelper();
const curveHelper = useCurveHelper();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();

// props

const props = defineProps({
  svgId: { type: String, default: "" },
});

const show = computed(() => {
  return (
    editModeStore.isCurveDrawingMode() || editModeStore.isCurveSelectedMode()
  );
});

const curveType = computed(() => {
  return editModeStore.isConcaveCurveMode() ? "CONCAVE" : "CONVEX";
});

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
  () => eventBus.bus.value.get("CONCAVE_CURVE_SELECTED"),
  (curve: CurveNotationAttributes) => {
    if (curve) onCurveSelected(curve);
  },
);

watch(
  () => eventBus.bus.value.get("CONVEX_CURVE_SELECTED"),
  (curve: CurveNotationAttributes) => {
    if (curve) onCurveSelected(curve);
  },
);

// event handlers

function onCurveSelected(curve: CurveNotationAttributes) {
  notationStore.selectNotation(curve.uuid);

  const evName =
    curve.notationType === "CONCAVECURVE"
      ? "CONCAVE_CURVE_SELECTED"
      : "CONVEX_CURVE_SELECTED";

  eventBus.emit(evName, null); // to enable re selection
}

// emitted by event manager
function onMouseDown(e: MouseEvent) {
  if (e.buttons !== 1) {
    // ignore right button
    return;
  }

  // user clicked elsewere after start drawing
  if (editModeStore.isCurveDrawingMode()) {
    editModeStore.setDefaultEditMode();
  }

  // new curve
  if (editModeStore.isCurveStartedMode()) {
    curveHelper.resetCurveDrawing();

    curveHelper.startCurveDrawing({
      x: e.offsetX,
      y: e.offsetY,
    });
    editModeStore.setNextEditMode();
  }
}

function setCurve(xPos: number, yPos: number) {
  curveHelper.calculateCurveProperties(curveType.value, xPos, yPos);

  const curveAttributes: CurveAttributes = curveHelper.getCurveAttributes();

  if (!curveAttributes) return;

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

  // temporarly show control point
  var c1 = document.getElementById("cp");
  c1!.setAttribute("cx", curveAttributes.cpx.toString());
  c1!.setAttribute("cy", curveAttributes.cpy.toString());

  document.getElementById("curve")!.setAttribute("d", curve);
}

function onMouseMove(e: MouseEvent) {
  // ignore right button
  if (e.buttons !== 1) {
    return;
  }

  if (!editModeStore.isCurveDrawingMode()) {
    return;
  }

  setCurve(e.offsetX, e.offsetY);
}

function onMouseUp() {
  // line yet not modified
  if (editModeStore.isCurveDrawingMode()) {
    endDrawCurve();
  }
}


function endDrawCurve() {
  const curveAttributes: CurveAttributes = curveHelper.getCurveAttributes();

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
    p1y: Math.max(curveAttributes.p1y, curveAttributes.p2y),
    p2y: Math.min(curveAttributes.p1y, curveAttributes.p2y),
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
