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
import { RectNotationAttributes } from "../../../math-common/src/baseTypes";
import { EditMode } from "../../../math-common/src/unions";

import useNotationMutateHelper from "../helpers/notationMutateHelper";
import usescreenHelper from "../helpers/screenHelper";
import useWatchHelper from "../helpers/watchHelper";
import { update } from "cypress/types/lodash";
const notationMutateHelper = useNotationMutateHelper();
const watchHelper = useWatchHelper();

let textValue = ref("");
const cellStore = useCellStore();
const notationStore = useNotationStore();
const emit = defineEmits(["hide"]);
const editModeStore = useEditModeStore();
const screenHelper = usescreenHelper();
const show = computed(() => editModeStore.getEditMode() === "TEXT_WRITING");

const selectedNotation = computed(() =>
  notationStore.getSelectedNotations()?.length == 0
    ? null
    : (notationStore.getSelectedNotations().at(0) as RectNotationAttributes),
);

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

// area selector signals the selected position
watchHelper.watchCustomEvent(
  "TEXT_AREA_SELECTING",
  "EV_AREA_SELECTION_DONE",
  startTextEditing,
);

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

  setInitialTextDimensions();

  hideTextNotation(selectedNotation.value!.uuid);

  const textEl = document.getElementById("textAreaEl")! as HTMLTextAreaElement;

  setTimeout(() => {
    textEl.focus();
  }, 0);

  //  observeTextSize(textEl);
}

function observeTextSize(textEl: HTMLTextAreaElement) {
  textEl.onmouseup = () => {
    const selectionPosition = {
      left: textLeft.value,
      top: textTop.value,
      width: textWidth.value,
      height: textHeight.value,
    };
    startTextEditing(selectionPosition);
  };

  new ResizeObserver(updateTextSize).observe(textEl);
}

function updateTextSize(entries: ResizeObserverEntry[]) {
  const entry = entries[0];
  textWidth.value = entry.contentRect.width;
  textHeight.value = entry.contentRect.height;
}

// set text area dimensions upon notation selection
function setInitialTextDimensions() {
  if (!selectedNotation.value) return;

  textLeft.value =
    cellStore.getSvgBoundingRect().x +
    window.scrollX +
    selectedNotation.value.fromCol * cellStore.getCellHorizontalWidth();

  textTop.value =
    cellStore.getSvgBoundingRect().y +
    window.scrollY +
    selectedNotation.value.fromRow * cellStore.getCellVerticalHeight();

  textHeight.value =
    (selectedNotation.value.toRow - selectedNotation.value.fromRow + 1) *
    cellStore.getCellVerticalHeight();

  textWidth.value =
    (selectedNotation.value.toCol - selectedNotation.value.fromCol + 1) *
    cellStore.getCellHorizontalWidth();
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

  if (selectedNotation.value && rectCoordinates) {
    const updatedNotation = selectedNotation.value;
    updatedNotation.value = textValue.value;
    Object.assign(updatedNotation, rectCoordinates);

    notationMutateHelper.updateNotation(updatedNotation);
    restoreTextNotation(updatedNotation.uuid);
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
