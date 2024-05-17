<template>
  <v-textarea
    wrap="hard"
    v-if="show"
    style="position: absolute"
    v-bind:style="{
      left: textLeft + 'px',
      top: textTop + 'px',
      width: textWidth + 'px',
    }"
    v-bind:rows="rows"
    autofocus
    v-model="textValue"
    background-color="grey lighten-2"
    color="cyan"
    v-on:blur="submitText"
  >
  </v-textarea>
</template>

<script setup lang="ts">
import { computed, watch, ref } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { RectNotationAttributes } from "../../../math-common/build/baseTypes";
import { AreaCoordinates } from "../../../math-common/build/globals";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useElementFinderHelper from "../helpers/elementFinderHelper";
import useEventBus from "../helpers/eventBusHelper";

const notationMutateHelper = useNotationMutateHelper();

let textValue = ref("");

const notationStore = useNotationStore();
const eventBus = useEventBus();
const emit = defineEmits(["hide"]);
const editModeStore = useEditModeStore();
const elementFinderHelper = useElementFinderHelper();

const show = computed(() => editModeStore.getEditMode() === "TEXT_WRITING");

const props = defineProps({
  svgId: { type: String, default: "" },
});

// watch(
//   () => eventBus.bus.value.get("SVG_MOUSEDOWN"),
//   (e: MouseEvent) => {
//     handleMouseDown(e);
//   },
// );

// area selector signals the selected position attributes
watch(
  () => eventBus.bus.value.get("SELECTION_DONE"),
  (selectionPosition: any) => {
    if (editModeStore.getEditMode() === "TEXT_WRITING") {
      setInitialTextValue();
      textLeft.value = selectionPosition.left;
      textTop.value = selectionPosition.top;
      textHeight.value = selectionPosition.height;
      textWidth.value = selectionPosition.width;
    }
  },
);

let textLeft = ref(0);
let textTop = ref(0);
let textHeight = ref(0);
let textWidth = ref(0);

const textArea = computed(() => {
  return {
    x1: textLeft.value,
    x2: textLeft.value + textWidth.value,
    y1: textTop.value,
    y2: textTop.value + textHeight.value,
  };
});

const rows = computed(() => {
  return Math.max(
    1,
    Math.floor(textHeight.value / notationStore.getCellVerticalHeight()),
  );
});

// function handleMouseDown(e: MouseEvent) {
//   const editMode = editModeStore.getEditMode();

//   if (editMode == "TEXT_WRITING" && textValue.value) {
//     submitText();
//   }
// }

function setInitialTextValue() {
  textValue.value = "";
  if (notationStore.getSelectedNotations()[0]?.notationType == "TEXT")
    textValue.value = (
      notationStore.getSelectedNotations()[0] as RectNotationAttributes
    ).value;
}

function submitText() {
  if (!textValue.value) return;

  editModeStore.setNextEditMode();
  const textCells = elementFinderHelper.findCoordinatesCellArea(
    props.svgId,
    textArea.value,
  );
  notationMutateHelper.upsertTextNotation(textValue.value, textCells);
}
</script>
