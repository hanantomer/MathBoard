<template>
  <input
    v-show="show"
    v-bind:style="{
      left: leftPosition + 'px',
      top: topPosition + 'px',
      width: width + 'px',
      height: height + 'px',
      position: 'absolute',
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
import { computed, ref } from "vue";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { ExponentNotationAttributes } from "../../../math-common/src/baseTypes";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useScreenHelper from "../helpers/screenHelper";
import useWatchHelper from "../helpers/watchHelper";

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
    : (notationStore
        .getSelectedNotations()
        .at(0) as ExponentNotationAttributes),
);

const show = computed(() => editModeStore.getEditMode() === "EXPONENT_WRITING");

// user clicked on exponent icon and then clicked on a cell

watchHelper.watchMouseEvent(
  ["EXPONENT_STARTED"],
  "EV_SVG_MOUSEDOWN",
  startNewExponentAtMousePosition,
);

// user clicked outside of exponent editor
watchHelper.watchMouseEvent(
  ["EXPONENT_WRITING"],
  "EV_SVG_MOUSEDOWN",
  editModeStore.setNextEditMode,
);

watchHelper.watchMouseEvent(
  ["EXPONENT_SELECTED"],
  "EV_SVG_MOUSEDOWN",
  editSelectedExponentNotation,
);

// edit mode changed from "EXPONENT_WRITING" either by cell clik or toolbar click
watchHelper.watchEndOfEditMode(["EXPONENT_WRITING"], submitExponent);

// user typed Enter -> end editing and move to next edit mode to submit
watchHelper.watchKeyEvent(
  ["EXPONENT_WRITING"],
  "EV_KEYUP",
  endEditingByEnterKey,
);

///TODO: move to helper

function endEditingByEnterKey(e: KeyboardEvent) {
  const { code } = e;
  if (code === "Enter") {
    editModeStore.setNextEditMode();
  }
}

function startNewExponentAtMousePosition(e: MouseEvent) {
  if (e.buttons !== 1) return;

  editModeStore.setNextEditMode();

  cellStore.setSelectedCell(
    screenHelper.getClickedCell({
      x: e.pageX,
      y: e.pageY,
    }),
    false,
  );

  setInitialExponentValue();

  setExponentPosition();

  setTimeout(`document.getElementById("exponent")?.focus();`, 0);
}

function setExponentPosition() {
  const clickedCoordinates = screenHelper.getClickedCellTopLeftCoordinates(
    cellStore.getSelectedCell(),
  );

  leftPosition.value = clickedCoordinates.x;
  topPosition.value = clickedCoordinates.y;

  width.value = cellStore.getCellHorizontalWidth() -1;
  height.value = cellStore.getCellVerticalHeight() / 2;
}

function setSelectedExponentPosition() {
  if (!selectedNotation.value) return;

  leftPosition.value =
    cellStore.getSvgBoundingRect().x +
    window.scrollX +
    selectedNotation.value.col * cellStore.getCellHorizontalWidth();

  topPosition.value =
    cellStore.getSvgBoundingRect().y +
    window.scrollY +
    selectedNotation.value.row * cellStore.getCellVerticalHeight();
}

function editSelectedExponentNotation() {
  editModeStore.setEditMode("EXPONENT_WRITING");

  setSelectedExponentPosition();

  exponent.value = selectedNotation.value?.exponent!;
}

function setInitialExponentValue() {
  exponent.value = "";
}

function submitExponent() {
  editModeStore.setNextEditMode();

  if (!exponent.value) return;

  if (selectedNotation.value) {
    selectedNotation.value!.exponent = exponent.value;

    notationMutateHelper.updateNotation(selectedNotation.value);
  } else {
    notationMutateHelper.addExponentNotation(exponent.value);
  }
}
</script>

<style>
.exponentInput {
  position: absolute;
  z-index: 99;
  font-size: 9px;
  outline: none;
  padding: 1px dashed rgb(187, 144, 200);
  -webkit-box-shadow: 0 0 0 1px hsla(0, 0%, 0%, 0.5);
  -moz-box-shadow: 0 0 0 1px hsla(0, 0%, 0%, 0.5);
  box-shadow: 0 0 0 1px hsla(0, 0%, 0%, 0.5);
}
</style>
