<template>
  <lineWatcher
    :startEntry="{
      editMode: ['SQRT_STARTED'],
      func: setInitialPosition,
    }"
    :drawEntry="{
      editMode: ['SQRT_DRAWING'],
      func: drawLine,
    }"
    :editEntryFirstHandle="{
      editMode: ['SQRT_EDITING'],
      func: modify,
    }"
    :editEntrySecondHandle="{
      editMode: ['SQRT_EDITING'],
      func: modify,
    }"
    :saveEntry="{
      editMode: ['SQRT_DRAWING', 'SQRT_EDITING'],
      func: endDrawing,
    }"
    :selectEntry="{
      editMode: ['SQRT_SELECTED'],
      func: selectSqrt,
      event: 'EV_SQRT_SELECTED',
    }"
    :moveByKeyEntry="{
      editMode: ['SQRT_SELECTED'],
      func: moveSqrt,
    }"
    :endEntry="{
      editMode: ['SQRT_SELECTED'],
    }"
  />
  <div v-if="show">
    <line-handle
      drawing-mode="SQRT_DRAWING"
      editing-mode="SQRT_EDITING"
      v-bind:style="{
        left: handleX + 'px',
        top: handleY + 'px',
      }"
    >
    </line-handle>

    <svg
      height="800"
      width="1500"
      xmlns="http://www.w3.org/2000/svg"
      class="line-svg"
    >
      <line
        :x1="sqrtLeft"
        :y1="sqrtY"
        :x2="sqrtRight"
        :y2="sqrtY"
        class="line"
        stroke="black"
      />
    </svg>
    <p
      class="sqrtsymbol"
      v-bind:style="{
        left: sqrtSymbolLeft + 'px',
        top: sqrtSymbolY + 'px',
      }"
    >
      &#x221A;
    </p>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useScreenHelper from "../helpers/screenHelper";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import {
  DotCoordinates,
  SqrtNotationAttributes,
  NotationAttributes,
  MultiCellAttributes,
  LineAttributes,
} from "common/baseTypes";
import lineHandle from "./LineHandle.vue";
import lineWatcher from "./LineWatcher.vue";

import { sqrtDeltaY } from "common/globals";

const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationMutateHelper = useNotationMutateHelper();
const screenHelper = useScreenHelper();

let linePosition = ref(<LineAttributes>{
  p1x: 0,
  p2x: 0,
  p1y: 0,
  p2y: 0,
});

const show = computed(() => {
  return (
    editModeStore.isSqrtDrawingMode() ||
    editModeStore.isSqrtEditMode() ||
    editModeStore.isSqrtSelectedMode()
  );
});

let sqrtRight = computed(() => {
  return linePosition.value.p2x;
});

let sqrtLeft = computed(() => {
  return linePosition.value.p1x + cellStore.getCellHorizontalWidth();
});

let sqrtY = computed(() => {
  return linePosition.value.p1y;
});

let sqrtSymbolLeft = computed(() => {
  return (
    linePosition.value.p1x + (cellStore.getSvgBoundingRect().left ?? 0) + 4
  );
});

let sqrtSymbolY = computed(() => {
  return linePosition.value.p1y + (cellStore.getSvgBoundingRect().top ?? 0) - 5;
});

let handleX = computed(() => {
  return sqrtRight.value + (cellStore.getSvgBoundingRect().left ?? 0);
});

let handleY = computed(() => {
  return sqrtY.value + (cellStore.getSvgBoundingRect().top ?? 0) - 5;
});

function setInitialPosition(p: DotCoordinates) {
  // Adjust p to be relative to the SVG container
  p = {
    x: p.x,
    y: p.y + cellStore.getSvgBoundingRect().y,
  };

  const nearestRowY =
    screenHelper.getCellByDotCoordinates(p).row *
    cellStore.getCellVerticalHeight();

  linePosition.value.p1x = p.x - 10;
  linePosition.value.p2x = p.x + cellStore.getCellHorizontalWidth() * 4;

  linePosition.value.p1y = nearestRowY + sqrtDeltaY;

  linePosition.value.p2y = linePosition.value.p1y;
}

function drawLine(p: DotCoordinates) {
  linePosition.value.p2x = p.x;
}

async function endDrawing(): Promise<string> {
  const fromCol = Math.round(
    linePosition.value.p1x / cellStore.getCellHorizontalWidth(),
  );

  let toCol = Math.round(
    linePosition.value.p2x / cellStore.getCellHorizontalWidth(),
  );

  let row = Math.round(
    linePosition.value.p1y / cellStore.getCellVerticalHeight(),
  );

  const uuid = await saveSqrt({ fromCol: fromCol, toCol: toCol, row: row });

  return uuid;
}

function modify(p: DotCoordinates) {
  linePosition.value.p2x = p.x;
}

async function saveSqrt(sqrtAttributes: MultiCellAttributes): Promise<string> {
  if (notationStore.getSelectedNotations().length > 0) {
    let updatedSqrt = {
      ...notationStore.getSelectedNotations().at(0)!,
      ...sqrtAttributes,
    };

    return await notationMutateHelper.updateSqrtNotation(updatedSqrt);
  } else return await notationMutateHelper.addSqrtNotation(sqrtAttributes);
}

function selectSqrt(notation: NotationAttributes) {
  const n = notation as SqrtNotationAttributes;

  linePosition.value.p1x = n.fromCol * cellStore.getCellHorizontalWidth();

  linePosition.value.p2x = n.toCol * cellStore.getCellHorizontalWidth();

  linePosition.value.p1y =
    n.row * cellStore.getCellVerticalHeight() + sqrtDeltaY;

  linePosition.value.p2y = n.row * cellStore.getCellVerticalHeight();
}

function moveSqrt(moveX: number, moveY: number) {
  linePosition.value.p1x += moveX;
  linePosition.value.p2x += moveX;
  linePosition.value.p1y += moveY;
  linePosition.value.p2y += moveY;
}
</script>
