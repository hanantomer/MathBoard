<template>
  <textarea
    autofocus
    id="textAreaEditor"
    v-if="show"
    class="freeText"
    style="resize: both !important; margin: 0"
    v-bind:style="{
      left: textLeft + 'px',
      top: textTop + 'px',
      width: textWidth + 'px',
      height: textHeight + 'px',
    }"
    ref="textAreaEl"
    v-model="textValue"
    v-on:blur="onBlur"
  >
  </textarea>
</template>

<script setup lang="ts">
import { computed, watch, ref } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { RectNotationAttributes } from "../../../math-common/build/baseTypes";
import { cellSpace } from "../../../math-common/src/globals";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useElementFinderHelper from "../helpers/elementFinderHelper";
import useEventBus from "../helpers/eventBusHelper";

const notationMutateHelper = useNotationMutateHelper();

let initialTextValue = "";
let textValue = ref("");
let textAreaEl = ref<HTMLTextAreaElement | null>(null);

const notationStore = useNotationStore();
const eventBus = useEventBus();
const emit = defineEmits(["hide"]);
const editModeStore = useEditModeStore();

const elementFinderHelper = useElementFinderHelper();

const show = computed(() => editModeStore.getEditMode() === "TEXT_WRITING");

const props = defineProps({
  svgId: { type: String, default: "" },
});

const svgDimensions = computed(() => {
  return document.getElementById(props.svgId)?.getBoundingClientRect()!;
});

// area selector signals the selected position attributes
watch(
  () => eventBus.bus.value.get("SELECTION_DONE"),
  (selectionPosition: any) => {
    setInitialTextValue();
    textLeft.value = selectionPosition.left;
    textTop.value = selectionPosition.top;
    textHeight.value = selectionPosition.height;
    textWidth.value = selectionPosition.width;
  },
);

// user selected text notation
watch(
  () => eventBus.bus.value.get("FREE_TEXT_SELECTED"),
  (textNotation: RectNotationAttributes) => {
    if (!textNotation) return;
    eventBus.bus.value.delete("FREE_TEXT_SELECTED");
    //notationStore.deleteNotation(textNotation.uuid);
    document!.querySelector<HTMLElement>(
      `foreignObject[uuid="${textNotation.uuid}"]`,
    )!.style.display = "none";

    editModeStore.setEditMode("TEXT_WRITING");

    setInitialTextValue();

    textLeft.value =
      svgDimensions.value.left +
      textNotation.fromCol *
        (notationStore.getCellHorizontalWidth() + cellSpace);

    textTop.value =
      svgDimensions.value.top +
      textNotation.fromRow *
        (notationStore.getCellVerticalHeight() + cellSpace);

    textHeight.value =
      (textNotation.toRow - textNotation.fromRow + 1) *
      (notationStore.getCellVerticalHeight() + cellSpace);

    textWidth.value =
      (textNotation.toCol - textNotation.fromCol + 1) *
      (notationStore.getCellHorizontalWidth() + cellSpace);

    textAreaEl.value?.focus();
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

function setInitialTextValue() {
  textValue.value = "";
  if (notationStore.getSelectedNotations()[0]?.notationType == "TEXT")
    textValue.value = (
      notationStore.getSelectedNotations()[0] as RectNotationAttributes
    ).value;
  initialTextValue = textValue.value;
}

function onBlur() {
  editModeStore.setDefaultEditMode();
  if (initialTextValue === textValue.value) return;
  submitText();
}

function submitText() {
  editModeStore.setNextEditMode();
  const textCells = elementFinderHelper.findCoordinatesCellArea(
    props.svgId,
    textArea.value,
  );
  notationMutateHelper.upsertTextNotation(textValue.value, textCells);
}
</script>
<style>
#textAreaEditor {
  resize: both;
}
.freeText {
  background-color: lightyellow;
  position: absolute;
}
</style>
