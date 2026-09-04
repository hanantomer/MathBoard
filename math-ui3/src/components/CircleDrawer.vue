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
      v-show="handlesInteractive"
      v-bind:style="{
        left: handleX1 + 'px',
        top: handleY1 + 'px',
      }"
    ></line-handle>
    <line-handle
      data-cy="circleRightHandle"
      drawing-mode="CIRCLE_DRAWING"
      editing-mode="CIRCLE_EDITING"
      v-show="handlesInteractive"
      v-bind:style="{
        left: handleX2 + 'px',
        top: handleY2 + 'px',
      }"
    ></line-handle>

    <svg
      id="circleDrawerSvg"
      :style="lineSvgScreenStyle"
      :viewBox="overlayViewBox"
      preserveAspectRatio="none"
      class="line-svg"
      xmlns="http://www.w3.org/2000/svg"
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
import lineHandle, { LINE_HANDLE_HALF } from "./LineHandle.vue";
import lineWatcher from "./LineWatcher.vue";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import { computed, nextTick, ref, watch } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import {
  DotCoordinates,
  CircleAttributes,
  NotationAttributes,
  CircleNotationAttributes,
} from "common/baseTypes";
import { matrixSize } from "common/globals";
import {
  getBoardSvgUserExtent,
  svgUserToViewport,
} from "../helpers/pointerCoordinateHelper";

const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const cellStore = useCellStore();

const circleAttributes = ref<CircleAttributes>({
  cx: 0,
  cy: 0,
  r: 0,
});

function roundPoint(point: DotCoordinates): DotCoordinates {
  return {
    x: Math.round(point.x),
    y: Math.round(point.y),
  };
}

const HANDLE_HALF = LINE_HANDLE_HALF;

const handlesInteractive = computed(() => {
  const mode = editModeStore.getEditMode();
  return mode === "CIRCLE_SELECTED" || mode === "CIRCLE_EDITING";
});

const overlayViewBox = computed(() => {
  cellStore.getSvgBoundingRect();
  const e = getBoardSvgUserExtent();
  if (!e.width || !e.height) return undefined;
  return `${e.x} ${e.y} ${e.width} ${e.height}`;
});

const handleX1 = computed(() => {
  cellStore.getSvgBoundingRect();
  return (
    svgUserToViewport(
      circleAttributes.value.cx - circleAttributes.value.r,
      circleAttributes.value.cy,
    ).x - HANDLE_HALF
  );
});

const handleY1 = computed(() => {
  cellStore.getSvgBoundingRect();
  return (
    svgUserToViewport(
      circleAttributes.value.cx - circleAttributes.value.r,
      circleAttributes.value.cy,
    ).y - HANDLE_HALF
  );
});

const handleX2 = computed(() => {
  cellStore.getSvgBoundingRect();
  return (
    svgUserToViewport(
      circleAttributes.value.cx + circleAttributes.value.r,
      circleAttributes.value.cy,
    ).x - HANDLE_HALF
  );
});

const handleY2 = computed(() => {
  cellStore.getSvgBoundingRect();
  return (
    svgUserToViewport(
      circleAttributes.value.cx + circleAttributes.value.r,
      circleAttributes.value.cy,
    ).y - HANDLE_HALF
  );
});

const show = computed(() => {
  return (
    editModeStore.isCircleDrawingMode() || editModeStore.isCircleSelectedMode()
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
    width: r.width ? `${r.width}px` : matrixSize.width,
    height: r.height ? `${r.height}px` : matrixSize.height,
    margin: "0",
    pointerEvents: "none" as const,
    overflow: "visible",
    zIndex: 998,
  };
});

function initCircle(p: DotCoordinates) {
  const point = roundPoint(p);
  circleAttributes.value.cx = point.x;
  circleAttributes.value.cy = point.y;
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
  const point = roundPoint(p);
  circleAttributes.value.r = Math.sqrt(
    Math.pow(point.x - circleAttributes.value.cx, 2) +
      Math.pow(point.y - circleAttributes.value.cy, 2),
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
  circleAttributes.value.cx = Math.round(circleAttributes.value.cx);
  circleAttributes.value.cy = Math.round(circleAttributes.value.cy);
  circleAttributes.value.r = Math.round(circleAttributes.value.r);

  const uuid = await saveCircle({
    cx: circleAttributes.value.cx,
    cy: circleAttributes.value.cy,
    r: circleAttributes.value.r,
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

  circleAttributes.value.cx = Math.round(circleAttributes.value.cx);
  circleAttributes.value.cy = Math.round(circleAttributes.value.cy);

  setCircleElement();
  saveCircle({
    cx: circleAttributes.value.cx,
    cy: circleAttributes.value.cy,
    r: circleAttributes.value.r,
  });
}
</script>
