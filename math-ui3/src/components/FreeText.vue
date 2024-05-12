<template>
  <v-textarea
    v-if="show"
    style="position: absolute"
    v-bind:style="{
      left: textLeft + 'px',
      top: textTop + 'px',
      width: textWidth + 'px',
      height: textHeight + 'px',
    }"
    autofocus
    v-model="textValue"
    background-color="grey lighten-2"
    color="cyan"
  >
  </v-textarea>
</template>

<script setup lang="ts">
import { watch, ref } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import useEventBus from "../helpers/eventBusHelper";
import { RectNotationAttributes } from "../../../math-common/build/baseTypes";
import { BusEventType } from "../../../math-common/build/unions";

let textValue = ref("");

const notationStore = useNotationStore();
const eventBus = useEventBus();
const emit = defineEmits(["hide"]);
const editModeStore = useEditModeStore();

watch(
  () => eventBus.bus.value.get("SVG_MOUSEDOWN"),
  (e: MouseEvent) => {
    handleMouseDown(e);
  },
);

// area selector signals the selected position attributes
watch(
  () => eventBus.bus.value.get("SELECTION_DONE"),
  (selectionPosition: any) => {
    if (editModeStore.getEditMode() === "TEXT_AREA_SELECTED") {
      setInitialTextValue();
      textLeft.value = selectionPosition.x1;
      textTop.value = selectionPosition.y1;
      textHeight.value = selectionPosition.y2 - selectionPosition.y1;
      textWidth.value = selectionPosition.x2 - selectionPosition.x1;
      show.value = true;
    }
  },
  { immediate: true, deep: true },
);

let show = ref(false);
let textLeft = ref(0);
let textTop = ref(0);
let textHeight = ref(0);
let textWidth = ref(0);

function handleMouseDown(e: MouseEvent) {
  const editMode = editModeStore.getEditMode();

  if (editMode == "TEXT_WRITING") {
    submitText();
  }
}

function setInitialTextValue() {
  textValue.value = "";
  if (notationStore.getSelectedNotations()[0]?.notationType == "TEXT")
    textValue.value = (
      notationStore.getSelectedNotations()[0] as RectNotationAttributes
    ).value;
}

function submitText() {
  editModeStore.setNextEditMode();
  show.value = false;
  eventBus.emit("FREE_TEXT_SUBMITTED", textValue.value);
}
</script>
