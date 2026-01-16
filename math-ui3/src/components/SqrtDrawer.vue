<template>
  <lineWatcher
    :startEntry="{
      editMode: [],
      func: () => {},
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
        class="sqrt"
        stroke="black"
      />
    </svg>
    <p
      class="sqrtsymbol"
      v-bind:style="{
        left: sqrtSymbolX + 'px',
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

import { EditMode } from "common/unions";

import lineHandle from "./LineHandle.vue";
import lineWatcher from "./LineWatcher.vue";
import useWatchHelper from "../helpers/watchHelper";

import { sqrtDeltaY } from "common/globals";
import selectionHelper from "src/helpers/selectionHelper";

const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationMutateHelper = useNotationMutateHelper();
const screenHelper = useScreenHelper();
const watchHelper = useWatchHelper();

let linePosition = ref(<LineAttributes>{
  p1x: 0,
  p2x: 0,
  p1y: 0,
  p2y: 0,
});

const show = computed(() => {
  return (
    editModeStore.isSqrtStartedMode() ||
    editModeStore.isSqrtDrawingMode() ||
    editModeStore.isSqrtEditMode() ||
    editModeStore.isSqrtSelectedMode()
  );
});

let sqrtRight = computed(() => {
  return linePosition.value.p2x - cellStore.getSvgBoundingRect().left;
});

let sqrtLeft = computed(() => {
  return linePosition.value.p1x - cellStore.getSvgBoundingRect().left + 8;
});

let sqrtY = computed(() => {
  return linePosition.value.p1y;
});

let sqrtSymbolX = computed(() => {
  return linePosition.value.p1x - 2;
});

let sqrtSymbolY = computed(() => {
  return linePosition.value.p1y + (cellStore.getSvgBoundingRect().top ?? 0) - 5;
});

let handleX = computed(() => {
  return linePosition.value.p2x;
});

let handleY = computed(() => {
  return sqrtY.value + (cellStore.getSvgBoundingRect().top ?? 0) - 5;
});

watchHelper.watchEveryEditModeChange(setInitialPosition);

function setInitialPosition(editMode: EditMode) {
  if (editMode !== "SQRT_STARTED") {
    return;
  }

  if (cellStore.getSelectedCell() == null) {
    return;
  }

  const selectedCell = cellStore.getSelectedCell();

  const p = screenHelper.getCellTopLeftCoordinates(selectedCell);

  const nearestRowY =
    screenHelper.getCellByDotCoordinates(p).row *
    cellStore.getCellVerticalHeight();

  linePosition.value.p1x = p.x - 10;
  linePosition.value.p2x = p.x + cellStore.getCellHorizontalWidth() * 4;

  linePosition.value.p1y = nearestRowY + sqrtDeltaY;

  linePosition.value.p2y = linePosition.value.p1y;

  endDrawing();


}

function drawLine(p: DotCoordinates) {
  linePosition.value.p2x = p.x;
}

async function endDrawing(): Promise<string> {
  const fromCol = Math.round(
    (linePosition.value.p1x - cellStore.getSvgBoundingRect().left) /
      cellStore.getCellHorizontalWidth(),
  );

  let toCol = Math.round(
    (linePosition.value.p2x - cellStore.getSvgBoundingRect().left) /
      cellStore.getCellHorizontalWidth(),
  );

  let row = Math.round(
    linePosition.value.p1y / cellStore.getCellVerticalHeight(),
  );

  const uuid = await saveSqrt({ fromCol: fromCol, toCol: toCol, row: row });

  editModeStore.setDefaultEditMode();

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

  linePosition.value.p1x =
    n.fromCol * cellStore.getCellHorizontalWidth() +
    cellStore.getSvgBoundingRect().left;

  linePosition.value.p2x =
    n.toCol * cellStore.getCellHorizontalWidth() +
    cellStore.getSvgBoundingRect().left;

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
