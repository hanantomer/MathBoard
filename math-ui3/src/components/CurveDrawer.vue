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
      <path id="curve" d="M0 0" stroke="green" stroke-width="4" stroke-linecap="round" fill="transparent">
      </path>
    </svg>
  </div>
</template>
<script setup lang="ts">
import useNotationMutateHelper from "../helpers/notationMutateHelper";

import { watch, computed, ref, PropType } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import {
  cellSpace,
  DotPosition,
  CurvePosition
} from "../../../math-common/src/globals";
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
  curveType: {type: Object as PropType<CurveType>, default: "CONCAVE"},
});


const show = computed(() => {
  return (
    editModeStore.isCurveDrawingMode() ||
    editModeStore.isCurveSelectedMode()
  );
});

let p1x = ref(0);
let p1y = ref(0);

let p2x = ref(0);
let p2y = ref(0);

let controlPoint1X = ref(0)
let controlPoint2 = ref(0)

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

  setCurve(e.offsetX, e.offsetY);
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
