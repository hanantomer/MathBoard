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
      maxlength="3"
      autofocus
      id="baseInput"
      class="baseInput"
      placeholder="base"
      autocomplete="off"
    />
    <input
      maxlength="3"
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
import { useNotationStore } from "../store/pinia/notationStore";
import { ExponentNotationAttributes } from "../../../math-common/build/baseTypes";
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

let exponentLeft = ref(0);
let exponentTop = ref(0);

const selectedNotation = computed(() =>
  notationStore.getSelectedNotations()?.length == 0
    ? null
    : (notationStore
        .getSelectedNotations()
        .at(0) as ExponentNotationAttributes),
);

const show = computed(
  () =>
    editModeStore.getEditMode() === "EXPONENT_WRITING" ||
    editModeStore.getEditMode() === "EXPONENT_SELECTED",
);

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

// user selected exponent notation
// watchHelper.watchNotationSelection(
//   "SYMBOL",
//   "EV_EXPONENT_SELECTED",
//   selectExponent,
// );

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

// function selectExponent(exponentNotation: ExponentNotationAttributes) {
//   if (!exponentNotation) return;

//   // first click -> select
//   if (!editModeStore.isTextSelectedMode()) {
//     editModeStore.setEditMode("EXPONENT_SELECTED");
//     return;
//   }

//   // second click -> edit
//   editSelectedExponentNotation();
// }

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

function setSelectedExponentPosition() {
  if (!selectedNotation.value) return;

  exponentLeft.value =
    cellStore.getSvgBoundingRect().x +
    window.scrollX +
    selectedNotation.value.fromCol * cellStore.getCellHorizontalWidth();

  exponentTop.value =
    cellStore.getSvgBoundingRect().y +
    window.scrollY +
    selectedNotation.value.row * cellStore.getCellVerticalHeight();
}

function resetExponentValue() {
  (document.getElementById("exponentInput") as HTMLInputElement).value = "";
  (document.getElementById("baseInput") as HTMLInputElement).value = "";
}

function editSelectedExponentNotation() {
  editModeStore.setEditMode("EXPONENT_WRITING");

  setSelectedExponentPosition();

  setInitialExponentValue();
}

function setInitialExponentValue() {
  (document.getElementById("baseInput") as HTMLInputElement).value =
    selectedNotation.value!.base!;
  (document.getElementById("exponentInput") as HTMLInputElement).value =
    selectedNotation.value!.exponent!;
}

function submitExponent() {
  editModeStore.setNextEditMode();

  if (
    !(document.getElementById("baseInput") as HTMLInputElement).value ||
    !(document.getElementById("exponentInput") as HTMLInputElement).value
  )
    return;

  if (selectedNotation.value) {
    selectedNotation.value!.base = (
      document.getElementById("baseInput") as HTMLInputElement
    ).value;
    selectedNotation.value!.exponent = (
      document.getElementById("exponentInput") as HTMLInputElement
    ).value;

    notationMutateHelper.updateNotation(selectedNotation.value);
  } else {
    notationMutateHelper.addExponentNotation(
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
