<template>
  <div v-show="show">
    <line-handle
      drawing-mode="CIRCLE_DRAWING"
      editing-mode="CIRCLE_EDITING"
      v-bind:style="{
        left: handleX1 + 'px',
        top: handleY1 + 'px',
      }"
    ></line-handle>
    <line-handle
      drawing-mode="CIRCLE_DRAWING"
      editing-mode="CIRCLE_EDITING"
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
      <circle
        id="circle"
        cx="0"
        cy="0"
        r="0"
        fill="none"
        stroke="black"
        stroke-width="3"
        style="position: absolute; pointer-events: none"
      ></circle>
    </svg>
  </div>
</template>
<script setup lang="ts">
import lineHandle from "./LineHandle.vue";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useWatchHelper from "../helpers/watchHelper";
import { computed, ref, onMounted } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import {
  CircleAttributes,
  CircleNotationAttributes,
} from "../../../math-common/build/baseTypes";
import useEventBusHelper from "../helpers/eventBusHelper";

const notationMutateHelper = useNotationMutateHelper();
const watchHelper = useWatchHelper();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const eventBusHelper = useEventBusHelper();

const circleAttributes = ref<CircleAttributes>({
  cx: 0,
  cy: 0,
  r: 0,
});

const handleX1 = computed(() => {
  return (
    circleAttributes.value.cx -
    circleAttributes.value.r +
    cellStore.getSvgBoundingRect().left -
    5
  );
});

const handleY1 = computed(() => {
  return circleAttributes.value.cy + cellStore.getSvgBoundingRect().left;
});

const handleX2 = computed(() => {
  return (
    circleAttributes.value.cx +
    circleAttributes.value.r +
    cellStore.getSvgBoundingRect().left
  );
});

const handleY2 = computed(() => {
  return circleAttributes.value.cy + cellStore.getSvgBoundingRect().left;
});

const show = computed(() => {
  return (
    editModeStore.isCircleDrawingMode() || editModeStore.isCircleSelectedMode()
  );
});

watchHelper.watchMouseEvent(["CIRCLE_STARTED"], "EV_SVG_MOUSEDOWN", initCircle);

watchHelper.watchMouseEvent(
  ["CIRCLE_DRAWING", "CIRCLE_EDITING"],
  "EV_SVG_MOUSEMOVE",
  setRadius,
);

watchHelper.watchMouseEvent(
  ["CIRCLE_DRAWING", "CIRCLE_EDITING"],
  "EV_SVG_MOUSEUP",
  endDrawCircle,
);

watchHelper.watchCustomEvent(
  ["CIRCLE_SELECTED"],
  "EV_CIRCLE_SELECTED",
  selectCircle,
);

watchHelper.watchMouseEvent(
  ["CIRCLE_SELECTED"],
  "EV_SVG_MOUSEDOWN",
  resetCircleSelection,
);

watchHelper.watchKeyEvent(
  ["CIRCLE_SELECTED"],
  "EV_KEYUP",
  function moveCircle(e: KeyboardEvent) {
    if (!notationStore.getSelectedNotations().length) return;

    const step = 1;
    switch (e.key) {
      case "ArrowLeft":
        circleAttributes.value.cx -= step;
        break;
      case "ArrowRight":
        circleAttributes.value.cx += step;
        break;
      case "ArrowUp":
        circleAttributes.value.cy -= step;
        break;
      case "ArrowDown":
        circleAttributes.value.cy += step;
        break;
    }

    setCircleElement();
    saveCircle({
      cx: circleAttributes.value.cx,
      cy: circleAttributes.value.cy,
      r: circleAttributes.value.r,
    });
  },
);

function initCircle(e: MouseEvent) {
  editModeStore.setNextEditMode();
  circleAttributes.value.cx = e.offsetX;
  circleAttributes.value.cy = e.offsetY;
  circleAttributes.value.r = 0;
  setCircleElement;
}

function selectCircle(circle: CircleNotationAttributes) {
  const c = circle;
  circleAttributes.value.cx = c.cx;
  circleAttributes.value.cy = c.cy;
  circleAttributes.value.r = c.r;
  setCircleElement();
  notationStore.selectNotation(c.uuid);
  eventBusHelper.remove("EV_CIRCLE_SELECTED", "CIRCLE_SELECTED");
}

function setRadius(e: MouseEvent) {
  circleAttributes.value.r = Math.sqrt(
    Math.pow(e.offsetX - circleAttributes.value.cx, 2) +
      Math.pow(e.offsetY - circleAttributes.value.cy, 2),
  );
  setCircleElement();
}

function setCircleElement() {
  const circle = document.getElementById("circle")!;
  circle.setAttribute("cx", circleAttributes.value.cx.toString());
  circle.setAttribute("cy", circleAttributes.value.cy.toString());
  circle.setAttribute("r", circleAttributes.value.r.toString());
}

function endDrawCircle() {
  saveCircle({
    cx: circleAttributes.value.cx,
    cy: circleAttributes.value.cy,
    r: Math.round(circleAttributes.value.r),
  });
  editModeStore.setNextEditMode();
}

function saveCircle(circleAttributes: CircleAttributes) {
  if (notationStore.getSelectedNotations().length > 0) {
    let updatedCircle = {
      ...notationStore.getSelectedNotations().at(0)!,
      ...circleAttributes,
    };

    notationMutateHelper.updateCircleNotation(
      updatedCircle as CircleNotationAttributes,
    );
  } else {
    notationMutateHelper.addCircleNotation(circleAttributes);
  }
}

function resetCircleSelection(e: MouseEvent) {
  const el = e.target as Element;
  if (el.tagName === "circle") {
    return;
  }
  editModeStore.setDefaultEditMode();
}
</script>

<style></style>
