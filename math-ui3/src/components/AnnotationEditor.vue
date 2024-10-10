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
    v-model="annotaionValue"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { RectNotationAttributes } from "../../../math-common/build/baseTypes";
import { cellSpace } from "../../../math-common/src/globals";
import { EditMode } from "../../../math-common/src/unions";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import usescreenHelper from "../helpers/screenHelper";
import useWatchHelper from "../helpers/watchHelper";
import useEventBus from "../helpers/eventBusHelper";

const notationMutateHelper = useNotationMutateHelper();
const watchHelper = useWatchHelper();
let annotaionValue = ref("");

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
let textWidth = 25;

watchHelper.watchEndOfEditMode("ANNOTATION_WRITING", submitText);

watchHelper.watchMouseEvent(
  ["ANNOTATION_STARTED"],
  "EV_SVG_MOUSEDOWN",
  startTextEditing,
);

watchHelper.watchKeyEvent(
  ["ANNOTATION_WRITING"],
  "EV_KEYUP",
  endEditingByEnterKey,
);

watchHelper.watchMouseEvent(
  ["ANNOTATION_WRITING"],
  "EV_SVG_MOUSEDOWN",
  editModeStore.setNextEditMode,
);

// user selected text notation
watchHelper.watchNotationSelection(
  "ANNOTATION_SELECTED",
  "EV_ANNOTATION_SELECTED",
  editSelectedAnnotation,
);

function startTextEditing(e: MouseEvent) {
  editModeStore.setNextEditMode();
  setInitialTextValue();
  textLeft.value = e.pageX;
  textTop.value = e.pageY;
  setTimeout('document.getElementById("annotationEl").focus()', 100);
}

function editSelectedAnnotation(textNotation: RectNotationAttributes) {
  editModeStore.setEditMode("ANNOTATION_WRITING");

  selectedNotation = textNotation;

  setInitialTextValue();

  setInitialTextDimensions(textNotation);

  hideTextNotation(textNotation.uuid);

  const textEl = document.getElementById(
    "annotationEl",
  )! as HTMLTextAreaElement;

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

  // textWidth.value =
  //   (textNotation.toCol - textNotation.fromCol + 1) *
  //     (cellStore.getCellHorizontalWidth() + cellSpace) -
  //   cellSpace;
}

function setInitialTextValue() {
  annotaionValue.value = "";
  if (selectedNotation?.value) {
    annotaionValue.value = selectedNotation?.value!;
  }
}

function submitText() {
  editModeStore.setNextEditMode();

  const annotationEl = document.getElementById("annotationEl")!;

  textLeft.value = parseInt(annotationEl.style.left.replace("px", ""));
  textTop.value = parseInt(annotationEl.style.top.replace("px", ""));

  const lineCoordinates = screenHelper.getLineAttributes({
    x1: textLeft.value + window.scrollX - cellStore.getSvgBoundingRect().x,
    x2:
      textLeft.value +
      textWidth +
      window.scrollX -
      cellStore.getSvgBoundingRect().x,
    y: textTop.value + window.scrollY - cellStore.getSvgBoundingRect().y,
  });

  if (selectedNotation && lineCoordinates) {
    selectedNotation.value = annotaionValue.value;
    selectedNotation = Object.assign(selectedNotation, lineCoordinates);

    notationMutateHelper.updateNotation(selectedNotation);
    restoreTextNotation(selectedNotation?.uuid);
  } else {
    notationMutateHelper.upsertAnnotationNotation(
      annotaionValue.value,
      lineCoordinates,
    );
  }
}

function hideTextNotation(uuid: string) {
  document!
    .querySelector<HTMLElement>(`foreignObject[uuid="${uuid}"]`)!
    .classList.add("hidden");
}

// restore text notation that was hideen during editing
function restoreTextNotation(uuid: string) {
  document!
    .querySelector<HTMLElement>(`foreignObject[uuid="${uuid}"]`)!
    .classList.remove("hidden");
}

function endEditingByEnterKey(e: KeyboardEvent) {
  const { code } = e;
  if (code === "Enter") {
    editModeStore.setNextEditMode();
  }
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
  font-size: small;
  height: 10px;
}
.hidden {
  display: none;
}
</style>
