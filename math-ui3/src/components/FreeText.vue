<template>
  <textarea
    v-show="show"
    class="freeText"
    v-bind:style="{
      left: textLeft + 'px',
      top: textTop + 'px',
      width: textWidth + 'px',
      height: textHeight + 'px',
    }"
    id="textAreaEl"
    v-model="textValue"
    v-bind:onblur="onLeave"
  >
  </textarea>
</template>

<script setup lang="ts">
import { computed, watch, ref } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { RectNotationAttributes } from "../../../math-common/build/baseTypes";
import { cellSpace } from "../../../math-common/src/globals";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import usescreenHelper from "../helpers/screenHelper";
import useEventBus from "../helpers/eventBusHelper";

const notationMutateHelper = useNotationMutateHelper();
let textValue = ref("");

const notationStore = useNotationStore();
const cellStore = useCellStore();
const eventBus = useEventBus();
const emit = defineEmits(["hide"]);
const editModeStore = useEditModeStore();

const screenHelper = usescreenHelper();

const show = computed(() => editModeStore.getEditMode() === "TEXT_WRITING");

let selectedNotation: RectNotationAttributes | null = null;

const props = defineProps({
  svgId: { type: String, default: "" },
});

const svgDimensions = computed(() => {
  return document.getElementById(props.svgId)?.getBoundingClientRect()!;
});

// watch(
//   () => editModeStore.getEditMode(),
//   (newEditMode, oldEditMode) => {
//     if (oldEditMode === "TEXT_WRITING" && newEditMode !== "TEXT_WRITING") {
//       onLeave();
//     }
//   },
// );

// area selector signals the selected position attributes
watch(
  () => eventBus.bus.value.get("SELECTION_DONE"),
  (selectionPosition: any) => {
    setInitialTextValue();
    textLeft.value = selectionPosition.left;
    textTop.value = selectionPosition.top;
    textHeight.value = selectionPosition.height;
    textWidth.value = selectionPosition.width;
    editModeStore.setEditMode("TEXT_WRITING");
    setTimeout('document.getElementById("textAreaEl").focus()', 100);
  },
);

// user selected text notation
watch(
  () => eventBus.bus.value.get("FREE_TEXT_SELECTED"),
  (textNotation: RectNotationAttributes) => {
    if (!textNotation) return;
    eventBus.bus.value.delete("FREE_TEXT_SELECTED");

    // fisrt click -> select
    if (!editModeStore.isTextSelectedMode()) {
      editModeStore.setEditMode("TEXT_SELECTED");
      return;
    }

    // second click -> edit
    editModeStore.setEditMode("TEXT_WRITING");

    hideTextNotation(textNotation.uuid);

    setInitialTextValue();

    selectedNotation = textNotation;

    textLeft.value =
      svgDimensions.value.left +
      textNotation.fromCol * (cellStore.getCellHorizontalWidth() + cellSpace) -
      cellSpace;

    textTop.value =
      svgDimensions.value.top +
      textNotation.fromRow * (cellStore.getCellVerticalHeight() + cellSpace) -
      cellSpace;

    textHeight.value =
      (textNotation.toRow - textNotation.fromRow + 1) *
        (cellStore.getCellVerticalHeight() + cellSpace) -
      cellSpace;

    textWidth.value =
      (textNotation.toCol - textNotation.fromCol + 1) *
        (cellStore.getCellHorizontalWidth() + cellSpace) -
      cellSpace;

    document.getElementById("textAreaEl")?.focus();
  },
);

let textLeft = ref(0);
let textTop = ref(0);
let textHeight = ref(0);
let textWidth = ref(0);

function setInitialTextValue() {
  textValue.value = "";
  if (notationStore.getSelectedNotations()[0]?.notationType == "TEXT")
    textValue.value = (
      notationStore.getSelectedNotations()[0] as RectNotationAttributes
    ).value;
}

function onLeave() {
  if (selectedNotation) {
    showTextNotation(selectedNotation.uuid);
  }

  editModeStore.setDefaultEditMode();
  //if (initialTextValue === textValue.value) return;
  /// TODO bring that back with or dimensions changed
  submitText();
}

function submitText() {
  editModeStore.setNextEditMode();

  const rectCoordinates = screenHelper.getRectAttributes({
    topLeft: {
      x: textLeft.value + window.scrollX,
      y: textTop.value + window.scrollY,
    },
    bottomRight: {
      x: textLeft.value + textWidth.value + window.scrollX,
      y: textTop.value + textHeight.value + window.scrollY,
    },
  });

  if (selectedNotation) {
    selectedNotation.value = textValue.value;
    selectedNotation = Object.assign(selectedNotation, rectCoordinates);
    notationMutateHelper.updateNotation(selectedNotation);
  } else {
    notationMutateHelper.upsertTextNotation(textValue.value, rectCoordinates);
  }
}

function hideTextNotation(uuid: string) {
  document!
    .querySelector<HTMLElement>(`foreignObject[uuid="${uuid}"]`)!
    .classList.add("hidden");
}

// show back text notation that was hideen during editing
function showTextNotation(uuid: string) {
  document!
    .querySelector<HTMLElement>(`foreignObject[uuid="${uuid}"]`)!
    .classList.remove("hidden");
}
</script>
<style>
textarea {
  resize: both;
}
.freeText {
  background-color: lightyellow;
  position: absolute;
  padding: 5px;
  box-sizing: border-box;
  resize: both;
}
.hidden {
  display: none;
}
</style>
