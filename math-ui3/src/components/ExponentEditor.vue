<template>
  <v-container
    class="exponentEditor"
    v-show="show"
    v-bind:style="{
      left: exponentLeft + 'px',
      top: exponentTop + 'px',
    }"
  >
    <v-row no-gutters>
      <v-col>
        <input
          id="exponentInput"
          class="exponentInput baseInput"
          placeholder="base"
        />
      </v-col>
      <v-col>
        <input id="baseInput" class="exponentInput" placeholder="exp" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, watch, ref } from "vue";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { ExponentNotationAttributes } from "../../../math-common/build/baseTypes";
import { EditMode } from "../../../math-common/src/unions";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useEventBus from "../helpers/eventBusHelper";
import useScreenHelper from "../helpers/screenHelper";

const notationMutateHelper = useNotationMutateHelper();

const eventBus = useEventBus();
const emit = defineEmits(["hide"]);
const editModeStore = useEditModeStore();
const screenHelper = useScreenHelper();

const show = computed(() => editModeStore.getEditMode() === "EXPONENT_WRITING");

let selectedNotation: ExponentNotationAttributes | null = null;

let exponentLeft = ref(0);
let exponentTop = ref(0);

const props = defineProps({
  svgId: { type: String, default: "" },
});

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
    if (
      newEditMode !== "EXPONENT_WRITING" &&
      oldEditMode === "EXPONENT_WRITING"
    ) {
      submitExponent();
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

function handleMouseDown(e: MouseEvent) {
  if (e.buttons !== 1) {
    return;
  }

  if (editModeStore.isExponentStartedMode()) {
    startNewExponent(e);
  }
}

function startNewExponent(e: MouseEvent) {
  editModeStore.setNextEditMode();
  document.getElementById("baseInput")?.setAttribute("value", "");
  document.getElementById("exponentInput")?.setAttribute("value", "");
  const clickedCoordinates = screenHelper.getClickedCellTopLeftCoordinates(
    props.svgId,
    { x: e.clientX, y: e.clientY },
  );

  exponentLeft.value = clickedCoordinates.x;
  exponentTop.value = clickedCoordinates.y;
}

function editSelectedExponentNotation(
  exponentNotation: ExponentNotationAttributes,
) {
  editModeStore.setEditMode("EXPONENT_WRITING");

  selectedNotation = exponentNotation;

  setInitialExponentValue();
}

function setInitialExponentValue() {
  document
    .getElementById("baseInput")
    ?.setAttribute("value", selectedNotation?.base!);
  document
    .getElementById("exponentInput")
    ?.setAttribute("value", selectedNotation?.exponent!);
}

function submitExponent() {
  editModeStore.setNextEditMode();

  if (
    !document.getElementById("baseInput")?.getAttribute("value") ||
    !document.getElementById("exponentInput")?.getAttribute("value")
  )
    return;

  if (selectedNotation) {
    selectedNotation.base = document
      .getElementById("baseInput")
      ?.getAttribute("value")!;
    selectedNotation.exponent = document
      .getElementById("exponentInput")
      ?.getAttribute("value")!;

    notationMutateHelper.updateNotation(selectedNotation);
  } else {
    notationMutateHelper.upsertExponentNotation(
      document.getElementById("baseInput")?.getAttribute("value")!,
      document.getElementById("exponentInput")?.getAttribute("value")!,
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
  top: 500px;
  left: 500px;
  box-sizing: border-box;
  width: 75px;
  height: 4%;
}
.exponentInput {
  border: 1px darkblue solid;
  padding: 1px;
  height: 25px;
  margin: 1px;
  width: 30px;
  font-size: 11px;
  background-color: transparent;
}
.baseInput {
  width: 35px;
  font-size: 14px;
  margin-top: 9px;
}
.hidden {
  display: none;
}
</style>
