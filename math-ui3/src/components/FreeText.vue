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
import { EditMode } from "../../../math-common/src/unions";
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

let textLeft = ref(0);
let textTop = ref(0);
let textHeight = ref(0);
let textWidth = ref(0);

watch(
  () => editModeStore.getEditMode() as EditMode,
  (newEditMode: EditMode, oldEditMode: any) => {
    if (newEditMode !== "TEXT_WRITING" && oldEditMode === "TEXT_WRITING") {
      onLeave();
    }
  },
  { immediate: true, deep: true },
);

// area selector signals the selected position attributes
watch(
  () => eventBus.bus.value.get("EV_SELECTION_DONE"),
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
  () => eventBus.bus.value.get("EV_FREE_TEXT_SELECTED"),
  (textNotation: RectNotationAttributes) => {
    if (!textNotation) return;
    eventBus.bus.value.delete("EV_FREE_TEXT_SELECTED");

    // fisrt click -> select
    if (!editModeStore.isTextSelectedMode()) {
      editModeStore.setEditMode("TEXT_SELECTED");
      return;
    }

    // second click -> edit
    editSelectedTextNotation(textNotation);
  },
);

function editSelectedTextNotation(textNotation: RectNotationAttributes) {
  editModeStore.setEditMode("TEXT_WRITING");

  selectedNotation = textNotation;

  setInitialTextValue();

  setInitialTextDimensions(textNotation);

  hideTextNotation(textNotation.uuid);

  const textEl = document.getElementById("textAreaEl")! as HTMLTextAreaElement;

  setTimeout(() => {
    textEl.focus();
  }, 0);
}

// set text area dimensions upon notation selection
function setInitialTextDimensions(textNotation: RectNotationAttributes) {
  textLeft.value =
    svgDimensions.value.left +
    window.scrollX +
    textNotation.fromCol * (cellStore.getCellHorizontalWidth() + cellSpace) -
    cellSpace;

  textTop.value =
    svgDimensions.value.top +
    window.scrollY +
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
}

function setInitialTextValue() {
  textValue.value = "";
  if (selectedNotation?.value) {
    textValue.value = selectedNotation?.value!;
  }
}

function onLeave() {
  console.debug("onleave");
  if (selectedNotation != null) {
    console.debug("show text notation");
    restoreTextNotation(selectedNotation.uuid);
  } else {
    console.debug("selected notation is null");
  }
  submitText();
}

function submitText() {
  editModeStore.setNextEditMode();

  const textAreaEl = document.getElementById("textAreaEl");

  textLeft.value = parseInt(textAreaEl.style.left.replace("px", ""));
  textWidth.value = parseInt(textAreaEl.style.width.replace("px", ""));
  textTop.value = parseInt(textAreaEl.style.top.replace("px", ""));
  textHeight.value = parseInt(textAreaEl.style.height.replace("px", ""));

  const rectCoordinates = screenHelper.getRectAttributes({
    topLeft: {
      x: textLeft.value + window.scrollX - svgDimensions.value.left,
      y: textTop.value + window.scrollY - svgDimensions.value.top,
    },
    bottomRight: {
      x:
        textLeft.value +
        textWidth.value +
        window.scrollX -
        svgDimensions.value.left,
      y:
        textTop.value +
        textHeight.value +
        window.scrollY -
        svgDimensions.value.top,
    },
  });

  if (selectedNotation && rectCoordinates) {
    selectedNotation.value = textValue.value;
    selectedNotation = Object.assign(selectedNotation, rectCoordinates);

    notationMutateHelper.updateNotation(selectedNotation);
  } else {
    notationMutateHelper.upsertTextNotation(textValue.value, rectCoordinates);
  }
  console.debug("selected notation is:" + selectedNotation);
}

function hideTextNotation(uuid: string) {
  console.debug("hide text notation:" + uuid);
  document!
    .querySelector<HTMLElement>(`foreignObject[uuid="${uuid}"]`)!
    .classList.add("hidden");
}

// restore text notation that was hideen during editing
function restoreTextNotation(uuid: string) {
  console.debug("restoring text notation:" + uuid);
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
