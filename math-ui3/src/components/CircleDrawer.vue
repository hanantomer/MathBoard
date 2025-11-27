<template>
  <lineWatcher
    :startEntry="{
      editMode: ['CIRCLE_STARTED'],
      func: initCircle,
    }"
    :drawEntry="{
      editMode: ['CIRCLE_DRAWING'],
      func: setRadius,
    }"
    :editEntryFirstHandle="{
      editMode: ['CIRCLE_EDITING'],
      func: setRadius,
    }"
    :editEntrySecondHandle="{
      editMode: ['CIRCLE_EDITING'],
      func: setRadius,
    }"
    :saveEntry="{
      editMode: ['CIRCLE_DRAWING', 'CIRCLE_EDITING'],
      func: endDrawCircle,
    }"
    :selectEntry="{
      editMode: ['CIRCLE_SELECTED'],
      func: selectCircle,
      event: 'EV_CIRCLE_SELECTED',
    }"
    :moveByKeyEntry="{
      editMode: ['CIRCLE_SELECTED'],
      func: moveCircle,
    }"
    :endEntry="{
      editMode: ['CIRCLE_SELECTED'],
    }"
  ></lineWatcher>
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
import lineWatcher from "./LineWatcher.vue";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useWatchHelper from "../helpers/watchHelper";
import useSelectionHelper from "../helpers/selectionHelper";
import { computed, ref, onMounted } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import {
  DotCoordinates,
  CircleAttributes,
  NotationAttributes,
  CircleNotationAttributes,
} from "common/baseTypes";
import useEventBusHelper from "../helpers/eventBusHelper";

const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const cellStore = useCellStore();

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

function initCircle(p: DotCoordinates) {
  circleAttributes.value.cx = p.x;
  circleAttributes.value.cy = p.y;
  circleAttributes.value.r = 0;
  setCircleElement();
}

function selectCircle(circle: NotationAttributes) {
  const c = circle as CircleNotationAttributes;
  circleAttributes.value.cx = c.cx;
  circleAttributes.value.cy = c.cy;
  circleAttributes.value.r = c.r;
  setCircleElement();
  (document.getElementById(circle.uuid) as HTMLElement).style.display = "none";
  notationStore.selectNotation(circle.uuid);
}

function setRadius(p: DotCoordinates) {
  circleAttributes.value.r = Math.sqrt(
    Math.pow(p.x - circleAttributes.value.cx, 2) +
      Math.pow(p.y - circleAttributes.value.cy, 2),
  );
  setCircleElement();
}

function setCircleElement() {
  const circle = document.getElementById("circle")!;
  circle.setAttribute("cx", circleAttributes.value.cx.toString());
  circle.setAttribute("cy", circleAttributes.value.cy.toString());
  circle.setAttribute("r", circleAttributes.value.r.toString());
}

async function endDrawCircle(): Promise<string> {
  const uuid = await saveCircle({
    cx: circleAttributes.value.cx,
    cy: circleAttributes.value.cy,
    r: Math.round(circleAttributes.value.r),
  });
  return uuid;
}

async function saveCircle(circleAttributes: CircleAttributes): Promise<string> {
  if (notationStore.getSelectedNotations().length > 0) {
    let updatedCircle = {
      ...notationStore.getSelectedNotations().at(0)!,
      ...circleAttributes,
    };

    notationMutateHelper.updateCircleNotation(
      updatedCircle as CircleNotationAttributes,
    );
    return updatedCircle.uuid;
  } else {
    return await notationMutateHelper.addCircleNotation(circleAttributes);
  }
}

function moveCircle(moveX: number, moveY: number) {
  if (!notationStore.getSelectedNotations().length) return;

  circleAttributes.value.cx += moveX;
  circleAttributes.value.cy += moveY;

  setCircleElement();
  saveCircle({
    cx: circleAttributes.value.cx,
    cy: circleAttributes.value.cy,
    r: circleAttributes.value.r,
  });
}
</script>

