<template>
  <textarea v-show="show" class="freeText" id="textAreaEl" v-model="textValue">
  </textarea>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useNotationStore } from "../store/pinia/notationStore";
import {
  RectCoordinates,
  RectNotationAttributes,
} from "../../../math-common/src/baseTypes";
import { EditMode } from "../../../math-common/src/unions";

import useNotationMutateHelper from "../helpers/notationMutateHelper";
import usescreenHelper from "../helpers/screenHelper";
import useWatchHelper from "../helpers/watchHelper";
const notationMutateHelper = useNotationMutateHelper();
const watchHelper = useWatchHelper();

let textValue = ref("");
const cellStore = useCellStore();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const screenHelper = usescreenHelper();
const show = computed(() => editModeStore.getEditMode() === "TEXT_WRITING");

const selectedNotation = computed(() =>
  notationStore.getSelectedNotations()?.length == 0
    ? null
    : (notationStore.getSelectedNotations().at(0) as RectNotationAttributes),
);

watchHelper.watchEveryEditModeChange(submitText);

// user clicked outside of text rect during edit
watchHelper.watchMouseEvent(
  ["TEXT_WRITING", "TEXT_SELECTED"],
  "EV_SVG_MOUSEDOWN",
  resetTextEditingIfClickedOusideTextArea,
);

// user clicked inside text rect after text selection
watchHelper.watchMouseEvent(
  ["TEXT_SELECTED"],
  "EV_SVG_MOUSEUP",
  editTextSelection,
);

// area selector signals the selected position
watchHelper.watchCustomEvent(
  ["TEXT_AREA_SELECTING"],
  "EV_AREA_SELECTION_DONE",
  startTextEditing,
);

watchHelper.watchMouseEvent(
  ["TEXT_WRITING"],
  "EV_TEXT_EDITING",
  editSelectedTextNotation,
);

watchHelper.watchCustomEvent(
  ["TEXT_WRITING"],
  "EV_SPECIAL_SYMBOL_SELECTED",
  addSpecialSymbol,
);

function editSelectedTextNotation(e: MouseEvent) {
  if (selectedNotation.value?.notationType !== "TEXT") {
    return;
  }

  editModeStore.setEditMode("TEXT_WRITING");

  setInitialTextValue();

  setInitialTextDimensions();

  const textEl = document.getElementById("textAreaEl")! as HTMLTextAreaElement;

  setTimeout(() => {
    textEl.focus();
  }, 0);
}

// set text area dimensions upon notation selection
function setInitialTextDimensions() {
  if (!selectedNotation.value) return;

  const textAreaEl = document.getElementById(
    "textAreaEl",
  )! as HTMLTextAreaElement;

  textAreaEl.style.left =
    cellStore.getSvgBoundingRect().x +
    //window.scrollX +
    selectedNotation.value.fromCol * cellStore.getCellHorizontalWidth() +
    "px";

  textAreaEl.style.top =
    cellStore.getSvgBoundingRect().y +
    //window.scrollY +
    selectedNotation.value.fromRow * cellStore.getCellVerticalHeight() +
    "px";

  textAreaEl.style.height =
    (selectedNotation.value.toRow - selectedNotation.value.fromRow + 1) *
      cellStore.getCellVerticalHeight() +
    "px";

  textAreaEl.style.width =
    (selectedNotation.value.toCol - selectedNotation.value.fromCol + 1) *
      cellStore.getCellHorizontalWidth() +
    "px";
}

function setInitialTextValue() {
  textValue.value = "";
  if (selectedNotation.value) {
    textValue.value = selectedNotation.value.value;
  }
}

function submitText(newEditMode: EditMode, oldEditMode: any) {
  if (newEditMode === "TEXT_WRITING" || oldEditMode !== "TEXT_WRITING") {
    return;
  }

  const textAreaEl = document.getElementById(
    "textAreaEl",
  )! as HTMLTextAreaElement;

  editModeStore.setNextEditMode();

  const rect = textAreaEl.getBoundingClientRect();

  const rectCoordinates = screenHelper.getRectAttributes({
    topLeft: {
      x: rect.left - cellStore.getSvgBoundingRect().x,
      y: rect.top - cellStore.getSvgBoundingRect().y,
    },
    bottomRight: {
      x: rect.right - cellStore.getSvgBoundingRect().x,
      y: rect.bottom - cellStore.getSvgBoundingRect().y,
    },
  });

  if (selectedNotation.value && rectCoordinates) {
    const updatedNotation = selectedNotation.value;
    updatedNotation.value = textValue.value;
    Object.assign(updatedNotation, rectCoordinates);

    notationMutateHelper.updateNotation(updatedNotation);
    showTextNotation(updatedNotation.uuid);
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
function showTextNotation(uuid: string) {
  document!
    .querySelector<HTMLElement>(`foreignObject[uuid="${uuid}"]`)!
    .classList.remove("hidden");
}

function resetTextEditingIfClickedOusideTextArea(e: MouseEvent) {
  // mouse clicked outside of text arae
  //  showTextNotation(selectedNotation.value!.uuid);
  if ((e.target as HTMLAreaElement).tagName != "TEXTAREA") {
    editModeStore.setDefaultEditMode();
  }
}

function editTextSelection(e: MouseEvent) {
  const el = e.target as HTMLElement;
  if (
    el.id !== "selection" &&
    (e.target as HTMLAreaElement).tagName != "TEXTAREA"
  ) {
    return;
  }
  editModeStore.setEditMode("TEXT_WRITING");

  const rect = el.getBoundingClientRect();

  startTextEditing({
    topLeft: {
      x: rect.left,
      y: rect.top,
    },
    bottomRight: {
      x: rect.right,
      y: rect.bottom,
    },
  });

  hideTextNotation(selectedNotation.value!.uuid);
}

function startTextEditing(selectionCoordinates: RectCoordinates) {
  setInitialTextValue();
  const textAreaEl = document.getElementById(
    "textAreaEl",
  )! as HTMLTextAreaElement;
  textAreaEl.style.left = selectionCoordinates.topLeft.x + "px";
  textAreaEl.style.top = selectionCoordinates.topLeft.y + "px";
  textAreaEl.style.height =
    selectionCoordinates.bottomRight.y - selectionCoordinates.topLeft.y + "px";
  textAreaEl.style.width =
    selectionCoordinates.bottomRight.x - selectionCoordinates.topLeft.x + "px";

  setTimeout('document.getElementById("textAreaEl").focus()', 100);
}

function addSpecialSymbol(symbol: String): void {
  if (!symbol) return;
  const textArea = document.getElementById("textAreaEl") as HTMLTextAreaElement;

  // Get cursor position
  const start = textArea.selectionStart;
  const end = textArea.selectionEnd;

  // Create a temporary div to decode HTML entities
  const decoder = document.createElement("div");
  decoder.innerHTML = symbol.toString();
  const decodedSymbol = decoder.textContent || decoder.innerText;

  // Insert decoded symbol at cursor position
  textValue.value =
    textValue.value.substring(0, start) +
    decodedSymbol +
    textValue.value.substring(end);

  // Reset cursor position after symbol
  setTimeout(() => {
    textArea.focus();
    textArea.setSelectionRange(
      start + decodedSymbol.length,
      start + decodedSymbol.length,
    );
  }, 0);
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
