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
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { RectNotationAttributes } from "../../../math-common/build/baseTypes";
import { cellSpace } from "../../../math-common/src/globals";
import { EditMode } from "../../../math-common/src/unions";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import usescreenHelper from "../helpers/screenHelper";
import useEventBus from "../helpers/eventBusHelper";
import useWatchHelper from "../helpers/watchHelper";

const notationMutateHelper = useNotationMutateHelper();
const watchHelper = useWatchHelper();

let textValue = ref("");
const cellStore = useCellStore();
const eventBus = useEventBus();
const emit = defineEmits(["hide"]);
const editModeStore = useEditModeStore();
const screenHelper = usescreenHelper();
const show = computed(() => editModeStore.getEditMode() === "TEXT_WRITING");

let selectedNotation: RectNotationAttributes | null = null;
let textLeft = ref(0);
let textTop = ref(0);
let textHeight = ref(0);
let textWidth = ref(0);

watchHelper.watchEveryEditMode(submitText);

watchHelper.watchMouseEvent(
  ["TEXT_WRITING"],
  "EV_SVG_MOUSEDOWN",
  resetTextEditing,
);

// area selector signals the selected position attributes

watchHelper.watchCustomEvent(
  "TEXT_AREA_SELECTING",
  "EV_AREA_SELECTION_DONE",
  startTextEditing,
);

// user clicked inside selected text notation (i.e second click)
watchHelper.watchNotationSelection(
  "TEXT_SELECTED",
  "EV_FREE_TEXT_SELECTED",
  editSelectedTextNotation,
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
    cellStore.getSvgBoundingRect().x +
    window.scrollX +
    textNotation.fromCol * (cellStore.getCellHorizontalWidth() + cellSpace) -
    cellSpace;

  textTop.value =
    cellStore.getSvgBoundingRect().y +
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

function submitText(newEditMode: EditMode, oldEditMode: any) {
  if (newEditMode === "TEXT_WRITING" || oldEditMode !== "TEXT_WRITING") {
    return;
  }

  editModeStore.setNextEditMode();

  const textAreaEl = document.getElementById("textAreaEl")!;

  textLeft.value = parseInt(textAreaEl.style.left.replace("px", ""));
  textWidth.value = parseInt(textAreaEl.style.width.replace("px", ""));
  textTop.value = parseInt(textAreaEl.style.top.replace("px", ""));
  textHeight.value = parseInt(textAreaEl.style.height.replace("px", ""));

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
        textHeight.value +
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

// restore text notation which was hideen during editing
function restoreTextNotation(uuid: string) {
  console.debug("restoring text notation:" + uuid);
  document!
    .querySelector<HTMLElement>(`foreignObject[uuid="${uuid}"]`)!
    .classList.remove("hidden");
}

function resetTextEditing(e: MouseEvent) {
  // mouse clicked outside of text arae
  if (e.target != document.getElementById("textAreaEl")) {
    editModeStore.setDefaultEditMode();
  }
}

function startTextEditing(selectionPosition: any) {
  setInitialTextValue();
  textLeft.value = selectionPosition.left;
  textTop.value = selectionPosition.top;
  textHeight.value = selectionPosition.height;
  textWidth.value = selectionPosition.width;
  setTimeout('document.getElementById("textAreaEl").focus()', 100);
}
</script>
<style>
textarea {
  resize: both;
}
.freeText {
  background-color: rgb(232, 232, 215);
  position: absolute;
  padding: 5px;
  box-sizing: border-box;
  resize: both;
}
.hidden {
  display: none;
}
</style>
