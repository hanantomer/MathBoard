<template>
  <v-container
    v-show="show"
    class="exponentEditor"
    v-bind:style="{
      left: exponentLeft + 'px',
      top: exponentTop + 'px',
    }"
  >
    <v-row style="height: 50px" no-gutters>
      <v-col align-self="start">
        <v-sheet class="pa-2 ma-2">
          <v-text-Field model="baseValue"></v-text-Field>
        </v-sheet>
      </v-col>
      <v-col align-self="end">
        <v-sheet class="pa-2 ma-2">
          <v-text-Field model="exponentValue"></v-text-Field>
        </v-sheet>
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

const notationMutateHelper = useNotationMutateHelper();
let exponentValue = ref("");
let baseValue = ref("");

const eventBus = useEventBus();
const emit = defineEmits(["hide"]);
const editModeStore = useEditModeStore();

const show = computed(() => editModeStore.getEditMode() === "EXPONENT_WRITING");

let selectedNotation: ExponentNotationAttributes | null = null;

let exponentLeft = ref(0);
let exponentTop = ref(0);

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

function editSelectedExponentNotation(
  exponentNotation: ExponentNotationAttributes,
) {
  editModeStore.setEditMode("EXPONENT_WRITING");

  selectedNotation = exponentNotation;

  setInitialExponentValue();
}

function setInitialExponentValue() {
    baseValue.value = selectedNotation?.base!;
    exponentValue.value = selectedNotation?.exponent!;
}


function submitExponent() {
  editModeStore.setNextEditMode();

  if (selectedNotation) {
    selectedNotation.base = baseValue.value;
    selectedNotation.exponent = exponentValue.value;

    notationMutateHelper.updateNotation(selectedNotation);
  } else {
    notationMutateHelper.upsertExponentNotation(baseValue.value, exponentValue.value);
  }
}
</script>
<style>
textarea {
  resize: both;
}
.exponentEditor {
  background-color: lightgray;
  position: absolute;
  padding: 5px;
  box-sizing: border-box;
}
.hidden {
  display: none;
}
</style>
