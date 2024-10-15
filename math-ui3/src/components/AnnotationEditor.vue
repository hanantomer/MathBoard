<template>
  <input
    v-show="show"
    maxlength="4"
    v-bind:style="{
      top: annotationTop + 'px',
      left: annotationLeft + 'px',
      width: annotationWidth + 'px',
      height: annotationHeight + 'px',
    }"
    id="annotationEl"
    v-model="annotaionValue"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { PointNotationAttributes } from "../../../math-common/build/baseTypes";
import { cellSpace } from "../../../math-common/src/globals";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import usescreenHelper from "../helpers/screenHelper";
import useWatchHelper from "../helpers/watchHelper";

const notationMutateHelper = useNotationMutateHelper();
const watchHelper = useWatchHelper();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();
const screenHelper = usescreenHelper();

let annotaionValue = ref("");

const show = computed(
  () => editModeStore.getEditMode() === "ANNOTATION_WRITING",
);

const annotationTop = computed(
  () =>
    cellStore.getSvgBoundingRect().y +
    window.scrollY +
    (annotationCell.value.row + 0.2) *
      (cellStore.getCellVerticalHeight() + cellSpace) -
    1,
);

const annotationLeft = computed(
  () =>
    cellStore.getSvgBoundingRect().x +
    window.scrollX +
    annotationCell.value.col *
      (cellStore.getCellHorizontalWidth() + cellSpace) -
    1,
);

const annotationWidth = computed(() => cellStore.getCellHorizontalWidth());

const annotationHeight = computed(
  () => cellStore.getCellVerticalHeight() / 2 + 2,
);

let selectedNotation: PointNotationAttributes | null = null;

let annotationCell = ref({ col: 0, row: 0 });

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
  annotationCell.value = screenHelper.getClickedCell({
    x: e.pageX,
    y: e.pageY,
  });

  editModeStore.setNextEditMode();
  setInitialTextValue();
  setTimeout('document.getElementById("annotationEl").focus()', 100);
}

function editSelectedAnnotation(annotation: PointNotationAttributes) {
  editModeStore.setEditMode("ANNOTATION_WRITING");

  selectedNotation = annotation;

  annotationCell.value = { ...annotation };

  setInitialTextValue();

  hideTextNotation(annotation.uuid);

  const textEl = document.getElementById(
    "annotationEl",
  )! as HTMLTextAreaElement;

  setTimeout(() => {
    textEl.focus();
  }, 0);
}

function setInitialTextValue() {
  annotaionValue.value = "";
  if (selectedNotation?.value) {
    annotaionValue.value = selectedNotation?.value!;
  }
}

function submitText() {
  editModeStore.setNextEditMode();

  if (selectedNotation) {
    selectedNotation.value = annotaionValue.value;
    notationMutateHelper.updateNotation(selectedNotation);
    restoreTextNotation(selectedNotation?.uuid);
  } else {
    notationMutateHelper.upsertAnnotationNotation(
      annotaionValue.value,
      annotationCell.value,
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
input {
  border: none;
  outline: none;
  background-color: lightyellow;
  position: absolute;
  padding: 0px;
  font-size: 0.5em;
}

.hidden {
  display: none;
}
</style>
