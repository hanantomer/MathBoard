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
import { computed, watch, ref } from "vue";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { ExponentNotationAttributes } from "../../../math-common/build/baseTypes";
import { EditMode } from "../../../math-common/src/unions";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useEventBus from "../helpers/eventBusHelper";
import useScreenHelper from "../helpers/screenHelper";
import useSelectionHelper from "../helpers/selectionHelper";

const notationMutateHelper = useNotationMutateHelper();
const eventBus = useEventBus();
const emit = defineEmits(["hide"]);
const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const screenHelper = useScreenHelper();
const selectionHelper = useSelectionHelper();

const show = computed(() => editModeStore.getEditMode() === "EXPONENT_WRITING");

let selectedNotation: ExponentNotationAttributes | null = null;

let exponentLeft = ref(0);
let exponentTop = ref(0);

const props = defineProps({
  svgId: { type: String },
});

const svgDimensions = computed(() => {
  return document.getElementById(props?.svgId)?.getBoundingClientRect()!;
});

// emitted by eventHelper
watch(
  () => eventBus.bus.value.get("EV_KEYUP"),
  async (e: KeyboardEvent) => {
    handleKeyUp(e);
  },
);

watch(
  () => eventBus.bus.value.get("EV_SVG_MOUSEDOWN"),
  (e: MouseEvent) => {
    if (!e) return;
    handleMouseDown(e);
  },
  { immediate: true },
);

watch(
  () => editModeStore.getEditMode() as EditMode,
  (newEditMode: EditMode, oldEditMode: any) => {
    // edit mode changed after exponent writing
    if (
      newEditMode !== "EXPONENT_WRITING" &&
      oldEditMode === "EXPONENT_WRITING"
    ) {
      submitExponent();
      return;
    }

    // cell selected after clicking on exponent icon
    if (newEditMode === "CELL_SELECTED" && oldEditMode === "EXPONENT_STARTED") {
      startNewExponent();
      return;
    }

    // exponent icon clicked after cell selection
    if (newEditMode === "EXPONENT_STARTED" && oldEditMode === "CELL_SELECTED") {
      startNewExponent();
      return;
    }
  },
  { immediate: true, deep: true },
);

// user selected exponent notation
watch(
  () => eventBus.bus.value.get("EV_EXPONENT_SELECTED"),
  (exponentNotation: ExponentNotationAttributes) => {
    if (!exponentNotation) return;
    eventBus.bus.value.delete("EV_EXPONENT_SELECTED");

    // first click -> select
    if (!editModeStore.isTextSelectedMode()) {
      editModeStore.setEditMode("EXPONENT_SELECTED");
      return;
    }

    // second click -> edit
    editSelectedExponentNotation(exponentNotation);
  },
);

function handleKeyUp(e: KeyboardEvent) {
  const { code } = e;
  if (code === "Enter" && editModeStore.getEditMode() == "EXPONENT_WRITING") {
    editModeStore.setNextEditMode();
  }
}

function handleMouseDown(e: MouseEvent) {
  if (e.buttons !== 1) {
    return;
  }

  if (editModeStore.isExponentStartedMode()) {
    selectionHelper.selectCell(props?.svgId, {
      x: e.pageX + svgDimensions.value.x,
      y: e.pageY + svgDimensions.value.y,
    });
    startNewExponent();
    return;
  }

  if (editModeStore.isExponentWritingMode()) {
    editModeStore.setNextEditMode();
    return;
  }
}

function startNewExponent() {
  editModeStore.setEditMode("EXPONENT_WRITING");
  (document.getElementById("exponentInput") as HTMLInputElement).value = "";
  (document.getElementById("baseInput") as HTMLInputElement).value = "";
  const clickedCoordinates = screenHelper.getClickedCellTopLeftCoordinates(
    props.svgId,
    cellStore.getSelectedCell(),
  );

  exponentLeft.value = clickedCoordinates.x;
  exponentTop.value = clickedCoordinates.y;

  setTimeout(`document.getElementById("baseInput")?.focus();`, 0);
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
