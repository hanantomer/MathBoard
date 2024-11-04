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
import { computed, ref } from "vue";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { RectNotationAttributes } from "../../../math-common/build/baseTypes";
import { EditMode } from "../../../math-common/src/unions";

import useNotationMutateHelper from "../helpers/notationMutateHelper";
import usescreenHelper from "../helpers/screenHelper";
import useWatchHelper from "../helpers/watchHelper";
const notationMutateHelper = useNotationMutateHelper();
const watchHelper = useWatchHelper();

let textValue = ref("");
const cellStore = useCellStore();
const notationStore = useNotationStore();
const emit = defineEmits(["hide"]);
const editModeStore = useEditModeStore();
const screenHelper = usescreenHelper();
const show = computed(() => editModeStore.getEditMode() === "TEXT_WRITING");

const selectedNotation =
  notationStore.getSelectedNotations()?.length == 0
    ? null
    : (notationStore.getSelectedNotations().at(0) as RectNotationAttributes);

//let selectedNotation: RectNotationAttributes | null = null;
let textLeft = ref(0);
let textTop = ref(0);
let textHeight = ref(0);
let textWidth = ref(0);

watchHelper.watchEveryEditModeChange(submitText);

// user clicked outside of text rect during edit
watchHelper.watchMouseEvent(
  ["TEXT_WRITING"],
  "EV_SVG_MOUSEDOWN",
  resetTextEditingIfClickedOuside,
);

// user clicked outside of text rect after text selection
watchHelper.watchMouseEvent(
  ["TEXT_SELECTED"],
  "EV_SVG_MOUSEDOWN",
  resetTextSelection,
);

// area selector signals the selected position attributes

watchHelper.watchCustomEvent(
  "TEXT_AREA_SELECTING",
  "EV_AREA_SELECTION_DONE",
  startTextEditing,
);

// user clicked inside selected text notation
// watchHelper.watchNotationSelection(
//   "SYMBOL",
//   "EV_FREE_TEXT_SELECTED",
//   () => {
//     editModeStore.setEditMode("TEXT_SELECTED");
//   },
// );

watchHelper.watchMouseEvent(
  ["TEXT_SELECTED"],
  "EV_SVG_MOUSEDOWN",
  editSelectedTextNotation,
);

function editSelectedTextNotation(e: MouseEvent) {
  const el = e.target as Element;
  if (el.tagName !== "TEXTAREA") {
    return;
  }

  editModeStore.setEditMode("TEXT_WRITING");

  setInitialTextValue();

  setInitialTextDimensions(selectedNotation!);

  hideTextNotation(selectedNotation!.uuid);

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
    textNotation.fromCol * cellStore.getCellHorizontalWidth();

  textTop.value =
    cellStore.getSvgBoundingRect().y +
    window.scrollY +
    textNotation.fromRow * cellStore.getCellVerticalHeight();

  textHeight.value =
    (textNotation.toRow - textNotation.fromRow + 1) *
    cellStore.getCellVerticalHeight();

  textWidth.value =
    (textNotation.toCol - textNotation.fromCol + 1) *
    cellStore.getCellHorizontalWidth();
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
    Object.assign(selectedNotation, rectCoordinates);

    notationMutateHelper.updateNotation(selectedNotation);
    restoreTextNotation(selectedNotation?.uuid);
  } else {
    notationMutateHelper.addTextNotation(textValue.value, rectCoordinates);
  }
}

function hideTextNotation(uuid: string) {
  document!
    .querySelector<HTMLElement>(`foreignObject[uuid="${uuid}"]`)!
    .classList.add("hidden");
}

// restore text notation which was hideen during editing
function restoreTextNotation(uuid: string) {
  document!
    .querySelector<HTMLElement>(`foreignObject[uuid="${uuid}"]`)!
    .classList.remove("hidden");
}

function resetTextEditingIfClickedOuside(e: MouseEvent) {
  // mouse clicked outside of text arae
  if (e.target != document.getElementById("textAreaEl")) {
    editModeStore.setDefaultEditMode();
  }
}

function resetTextSelection(e: MouseEvent) {
  const el = e.target as Element;
  if (el.tagName === "TEXTAREA") {
    return;
  }
  editModeStore.setDefaultEditMode();
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
