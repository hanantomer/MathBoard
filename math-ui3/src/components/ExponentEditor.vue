<template>
  <v-container
    class="exponentEditor"
    v-show="show"
    v-bind:style="{
      left: exponentLeft + 'px',
      top: exponentTop + 'px',
    }"
  >
    <input
      maxlength="4"
      autofocus
      id="baseInput"
      class="baseInput"
      placeholder="base"
      autocomplete="off"
    />
    <input
      maxlength="4"
      id="exponentInput"
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
import { ExponentNotationAttributes } from "../../../math-common/build/baseTypes";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useEventBus from "../helpers/eventBusHelper";
import useScreenHelper from "../helpers/screenHelper";
import useSelectionHelper from "../helpers/selectionHelper";
import useWatchHelper from "../helpers/watchHelper";

const notationMutateHelper = useNotationMutateHelper();
const eventBus = useEventBus();
const emit = defineEmits(["hide"]);
const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const screenHelper = useScreenHelper();
const selectionHelper = useSelectionHelper();
const watchHelper = useWatchHelper();


let selectedNotation: ExponentNotationAttributes | null = null;
let exponentLeft = ref(0);
let exponentTop = ref(0);

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

// user selected a cell then clicked on exponent button
watchHelper.watchEditModeTransition(
  "CELL_SELECTED",
  "EXPONENT_STARTED",
  startNewExponentAtSelectedCell,
);

// user selected exponent notation
watchHelper.watchNotationSelection(
  "SYMBOL",
  "EV_EXPONENT_SELECTED",
  selectExponent,
);

// edit mode changed from "EXPONENT_WRITING" either by cell clik or toolbar click
watchHelper.watchEndOfEditMode("EXPONENT_WRITING", submitExponent);

// user typed Enter -> end editing and move to next edit mode to submit
watchHelper.watchKeyEvent(
  ["EXPONENT_WRITING"],
  "EV_KEYUP",
  endEditingByEnterKey
);

function selectExponent(exponentNotation: ExponentNotationAttributes) {
  if (!exponentNotation) return;
  eventBus.remove("EV_EXPONENT_SELECTED", "SYMBOL");

  // first click -> select
  if (!editModeStore.isTextSelectedMode()) {
    editModeStore.setEditMode("EXPONENT_SELECTED");
    return;
  }

  // second click -> edit
  editSelectedExponentNotation(exponentNotation);
}

function endEditingByEnterKey(e: KeyboardEvent) {
  const { code } = e;
  if (code === "Enter") {
    editModeStore.setNextEditMode();
  }
}

function startNewExponentAtMousePosition(e: MouseEvent) {
  if (e.buttons !== 1) return;

  editModeStore.setNextEditMode();

  selectionHelper.setSelectedCell({
    x: e.pageX,
    y: e.pageY,
  });

  resetExponentValue();

  setExponentPosition();

  setTimeout(`document.getElementById("baseInput")?.focus();`, 0);
}

function startNewExponentAtSelectedCell() {

  editModeStore.setNextEditMode();

  resetExponentValue();

  setExponentPosition();

  setTimeout(`document.getElementById("baseInput")?.focus();`, 0);
}

function setExponentPosition() {
  const clickedCoordinates = screenHelper.getClickedCellTopLeftCoordinates(
    cellStore.getSelectedCell(),
  );
  exponentLeft.value = clickedCoordinates.x;
  exponentTop.value = clickedCoordinates.y;
}

function resetExponentValue() {
  (document.getElementById("exponentInput") as HTMLInputElement).value = "";
  (document.getElementById("baseInput") as HTMLInputElement).value = "";
}

function editSelectedExponentNotation(
  exponentNotation: ExponentNotationAttributes,
) {
  editModeStore.setEditMode("EXPONENT_WRITING");

  selectedNotation = exponentNotation;

  setInitialExponentValue();
}

function setInitialExponentValue() {
  (document.getElementById("baseInput") as HTMLInputElement).value =
    selectedNotation?.base!;
  (document.getElementById("exponentInput") as HTMLInputElement).value =
    selectedNotation?.exponent!;
}

function submitExponent() {
  editModeStore.setNextEditMode();

  if (
    !(document.getElementById("baseInput") as HTMLInputElement).value ||
    !(document.getElementById("exponentInput") as HTMLInputElement).value
  )
    return;

  if (selectedNotation) {
    selectedNotation.base = (
      document.getElementById("baseInput") as HTMLInputElement
    ).value;
    selectedNotation.exponent = (
      document.getElementById("exponentInput") as HTMLInputElement
    ).value;

    notationMutateHelper.updateNotation(selectedNotation);
  } else {
    notationMutateHelper.upsertExponentNotation(
      (document.getElementById("baseInput") as HTMLInputElement).value,
      (document.getElementById("exponentInput") as HTMLInputElement).value,
    );
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
  position: relative;
  bottom: 8px;
  border: 1px darkblue solid;
  height: 18px;
  width: 35px;
  font-size: 11px;
  margin-top: -0px;
  margin-left: 1px;
  padding: 2px;
}
.hidden {
  display: none;
}
</style>
