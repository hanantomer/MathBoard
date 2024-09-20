<template>
  <input
    v-show="show"
    class="annotation"
    v-bind:style="{
      top: textTop + 'px',
      left: textLeft + 'px',
      width: textWidth + 'px',
    }"
    id="annotationEl"
    v-model="textValue"
  />
</template>

<script setup lang="ts">
import { computed, watch, ref } from "vue";
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

const cellStore = useCellStore();
const eventBus = useEventBus();
const emit = defineEmits(["hide"]);
const editModeStore = useEditModeStore();

const screenHelper = usescreenHelper();

const show = computed(
  () => editModeStore.getEditMode() === "ANNOTATION_WRITING",
);

let selectedNotation: RectNotationAttributes | null = null;

let textTop = ref(0);
let textLeft = ref(0);
let textWidth = ref(0);

watch(
  () => editModeStore.getEditMode() as EditMode,
  (newEditMode: EditMode, oldEditMode: any) => {
    if (newEditMode !== "TEXT_WRITING" && oldEditMode === "TEXT_WRITING") {
      submitText();
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
    textWidth.value = selectionPosition.width;
    editModeStore.setEditMode("ANNOTATION_WRITING");
    setTimeout('document.getElementById("annotationEl").focus()', 100);
  },
);

// user selected text notation
watch(
  () => eventBus.bus.value.get("EV_ANNOTATION_SELECTED"),
  (textNotation: RectNotationAttributes) => {
    if (!textNotation) return;
    eventBus.bus.value.delete("EV_ANNOTATION_SELECTED");

    // first click -> select
    if (!editModeStore.isTextSelectedMode()) {
      editModeStore.setEditMode("ANNOTATION_SELECTED");
      return;
    }

    // second click -> edit
    editSelectedTextNotation(textNotation);
  },
);

function editSelectedTextNotation(textNotation: RectNotationAttributes) {
  editModeStore.setEditMode("ANNOTATION_WRITING");

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
    cellStore.getSvgBoundingRect().x +
    window.scrollX +
    textNotation.fromCol * (cellStore.getCellHorizontalWidth() + cellSpace) -
    cellSpace;

  textTop.value =
    cellStore.getSvgBoundingRect().y +
    window.scrollY +
    textNotation.fromRow * (cellStore.getCellVerticalHeight() + cellSpace) -
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

function submitText() {
  console.debug("submitText");
  editModeStore.setNextEditMode();

  const textAreaEl = document.getElementById("textAreaEl")!;

  textLeft.value = parseInt(textAreaEl.style.left.replace("px", ""));
  textWidth.value = parseInt(textAreaEl.style.width.replace("px", ""));
  textTop.value = parseInt(textAreaEl.style.top.replace("px", ""));

  const rectCoordinates = screenHelper.getRectAttributes({
    topLeft: {
      x: textLeft.value + window.scrollX - cellStore.getSvgBoundingRect().x,
      y: textTop.value + window.scrollY - cellStore.getSvgBoundingRect().y,
    },
    bottomRight: {
      x:
        textLeft.value +
        textWidth.value +
        window.scrollX -
        cellStore.getSvgBoundingRect().x,
      y:
        textTop.value +
        20 /*TODO: move to const*/ +
        window.scrollY -
        cellStore.getSvgBoundingRect().y,
    },
  });

  if (selectedNotation && rectCoordinates) {
    selectedNotation.value = textValue.value;
    selectedNotation = Object.assign(selectedNotation, rectCoordinates);

    notationMutateHelper.updateNotation(selectedNotation);
    restoreTextNotation(selectedNotation?.uuid);
  } else {
    notationMutateHelper.upsertTextNotation(textValue.value, rectCoordinates);
  }
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
.annotation {
  background-color: lightyellow;
  position: absolute;
  padding: 5px;
  box-sizing: border-box;
}
.hidden {
  display: none;
}
</style>
