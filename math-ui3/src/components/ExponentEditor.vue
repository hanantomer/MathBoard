<template>
  <input
    v-show="show"
    v-bind:style="{
      backgroundColor: 'lightyellow',
      left: leftPosition + 'px',
      top: topPosition + 'px',
      width: width + 'px',
      height: height + 'px',
      position: 'fixed',
    }"
    id="exponent"
    autofocus="true"
    maxlength="3"
    v-model="exponent"
    class="exponentInput"
    autocomplete="off"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { CellAttributes, PointNotationAttributes } from "common/baseTypes";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useScreenHelper from "../helpers/screenHelper";
import useWatchHelper from "../helpers/watchHelper";
import { viewportPointerPosition } from "../helpers/pointerCoordinateHelper";

const notationMutateHelper = useNotationMutateHelper();
const emit = defineEmits(["hide"]);
const editModeStore = useEditModeStore();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const screenHelper = useScreenHelper();
const watchHelper = useWatchHelper();

let exponent = ref("");

let leftPosition = ref(0);
let topPosition = ref(0);
let width = ref(0);
let height = ref(0);

const selectedNotation = computed(() =>
  notationStore.getSelectedNotations()?.length == 0
    ? null
    : (notationStore.getSelectedNotations().at(0) as PointNotationAttributes),
);

const show = computed(() => editModeStore.getEditMode() === "EXPONENT_WRITING");

let clickedCell: CellAttributes | undefined = undefined;

// user clicked on exponent icon and then clicked on a cell

watchHelper.watchPointerEvent(
  ["EXPONENT_STARTED"],
  ["EV_SVG_POINTERDOWN"],
  startNewExponentAtMousePosition,
);

// user clicked outside of exponent editor
watchHelper.watchPointerEvent(
  ["EXPONENT_WRITING"],
  ["EV_SVG_POINTERDOWN"],
  () => editModeStore.setEditMode("CELL_SELECTED"),
);

watchHelper.watchPointerEvent(
  ["EXPONENT_SELECTED"],
  ["EV_SVG_POINTERUP"],
  editSelectedExponentNotation,
);

// edit mode changed from "EXPONENT_WRITING" either by cell clik or toolbar click
watchHelper.watchEndOfEditMode(["EXPONENT_WRITING"], [], submitExponent);

watchHelper.watchKeyEvent(
  ["EXPONENT_STARTED"],
  "EV_KEYDOWN",
  startNewExponentAtSelectedCellPosition,
);

watchHelper.watchKeyEvent(["EXPONENT_SELECTED"], "EV_KEYUP", resumeSelection);

watchHelper.watchKeyEvent(["EXPONENT_WRITING"], "EV_KEYUP", endEditing);

watchHelper.watchEditModeTransition(
  ["CELL_SELECTED"],
  "EXPONENT_STARTED",
  startNewExponentAtSelectedCellPosition,
);

function endEditing(e: KeyboardEvent) {
  const { code } = e;
  if (
    code === "Enter" ||
    code === "NumpadEnter" ||
    code === "Tab" ||
    code === "Escape"
  ) {
    editModeStore.setEditMode("CELL_SELECTED");
  }
}

function resumeSelection(e: KeyboardEvent) {
  const { code } = e;
  if (
    code === "ArrowDown" ||
    code === "ArrowUp" ||
    code === "ArrowLeft" ||
    code === "ArrowRight"
  ) {
    editModeStore.setEditMode("CELL_SELECTED");
  }
}

function startNewExponentAtSelectedCellPosition() {
  clickedCell = cellStore.getSelectedCell();

  setInitialExponentValue();

  setExponentPosition();

  editModeStore.setEditMode("EXPONENT_WRITING");

  setTimeout(`document.getElementById("exponent")?.focus();`, 0);
}

function startNewExponentAtMousePosition(e: PointerEvent) {
  cellStore.refreshSvgBoundingRect();
  clickedCell = screenHelper.getCellByDotCoordinates(
    viewportPointerPosition(e),
  );

  setInitialExponentValue();
  setExponentPosition();
  editModeStore.setEditMode("EXPONENT_WRITING");

  setTimeout(`document.getElementById("exponent")?.focus();`, 0);
}

function exponentCell(): CellAttributes | undefined {
  const selected = selectedNotation.value;
  if (selected?.notationType === "EXPONENT") {
    return { col: selected.col, row: selected.row };
  }
  return clickedCell;
}

function setExponentPosition() {
  const cell = exponentCell();
  if (!cell) return;

  cellStore.refreshSvgBoundingRect();
  const { x, y } = screenHelper.getCellTopLeftCoordinates(cell);
  leftPosition.value = x;
  topPosition.value = y;
  width.value = Math.max(cellStore.getCellHorizontalWidth() - 1, 8);
  height.value = Math.max(cellStore.getCellVerticalHeight() / 2, 8);
}

function editSelectedExponentNotation() {
  clickedCell = exponentCell() ?? cellStore.getSelectedCell();
  setExponentPosition();
  editModeStore.setEditMode("EXPONENT_WRITING");
}

watch(
  () => [
    show.value,
    cellStore.getSvgBoundingRect().left,
    cellStore.getSvgBoundingRect().top,
  ],
  () => {
    if (show.value) setExponentPosition();
  },
);

function setInitialExponentValue() {
  exponent.value = "";
}

async function submitExponent() {
  editModeStore.setEditMode("CELL_SELECTED");

  if (!exponent.value) return;

  if (selectedNotation.value) {
    selectedNotation.value!.value = exponent.value;

    await notationMutateHelper.updateNotation(selectedNotation.value);
  } else {
    await notationMutateHelper.addExponentNotation(
      exponent.value,
      clickedCell!,
    );
  }
}
</script>

<style>
.exponentInput {
  position: fixed;
  z-index: 99;
  font-size: 9px;
  outline: none;
  padding: 1px dashed rgb(187, 144, 200);
  -webkit-box-shadow: 0 0 0 1px hsla(0, 0%, 0%, 0.5);
  -moz-box-shadow: 0 0 0 1px hsla(0, 0%, 0%, 0.5);
  box-shadow: 0 0 0 1px hsla(0, 0%, 0%, 0.5);
}
</style>
