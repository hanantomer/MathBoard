<template>
  <v-container
    class="exponentEditor"
    v-show="show"
    v-bind:style="{
      left: leftPosition + 'px',
      top: topPosition + 'px',
    }"
  >
    <input
      maxlength="3"
      autofocus="true"
      v-model="base"
      id="baseInput"
      class="baseInput"
      placeholder="base"
      autocomplete="off"
    />
    <input
      maxlength="3"
      v-model="exponent"
      class="exponentInput"
      placeholder="exp"
      autocomplete="off"
    />
  </v-container>
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
let base = ref("");

let leftPosition = ref(0);
let topPosition = ref(0);

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
watchHelper.watchEndOfEditMode("EXPONENT_WRITING", submitExponent);

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

  setTimeout(`document.getElementById("baseInput")?.focus();`, 0);
}

function setExponentPosition() {
  const clickedCoordinates = screenHelper.getClickedCellTopLeftCoordinates(
    cellStore.getSelectedCell(),
  );

  leftPosition.value = clickedCoordinates.x;
  topPosition.value = clickedCoordinates.y;
}

function setSelectedExponentPosition() {
  if (!selectedNotation.value) return;

  leftPosition.value =
    cellStore.getSvgBoundingRect().x +
    window.scrollX +
    selectedNotation.value.fromCol * cellStore.getCellHorizontalWidth();

  topPosition.value =
    cellStore.getSvgBoundingRect().y +
    window.scrollY +
    selectedNotation.value.row * cellStore.getCellVerticalHeight();
}

function editSelectedExponentNotation() {
  editModeStore.setEditMode("EXPONENT_WRITING");

  setSelectedExponentPosition();

  base.value = selectedNotation.value?.base!;
  exponent.value = selectedNotation.value?.exponent!;
}

function setInitialExponentValue() {
  base.value = "";
  exponent.value = "";
}

function submitExponent() {
  editModeStore.setNextEditMode();

  if (!base.value || !exponent.value) return;

  if (selectedNotation.value) {
    selectedNotation.value!.base = base.value;
    selectedNotation.value!.exponent = exponent.value;

    notationMutateHelper.updateNotation(selectedNotation.value);
  } else {
    notationMutateHelper.addExponentNotation(base.value, exponent.value);
  }
}
</script>

<style>
.exponentEditor {
  border: 1px darkblue solid;
  background-color: lightgray;
  position: absolute;
  padding: 1px;
  box-sizing: border-box;
  width: 75px;
  height: 32px;
}
.baseInput {
  border: 1px darkblue solid;
  height: 22px;
  width: 35px;
  font-size: 14px;
  margin-top: 5px;
  padding: 2px;
}
.exponentInput {
  bottom: 8px;
  border: 1px darkblue solid;
  height: 18px;
  width: 35px;
  font-size: 11px;
  margin-top: -0px;
  margin-left: 37px;
  padding: 2px;
}
.hidden {
  display: none;
}
</style>
