<template>
  <input
    v-show="show"
    class ="annotation"
    maxlength="3"
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
import { useNotationStore } from "../store/pinia/notationStore";
import { AnnotationNotationAttributes } from "../../../math-common/src/baseTypes";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import usescreenHelper from "../helpers/screenHelper";
import useWatchHelper from "../helpers/watchHelper";

const notationMutateHelper = useNotationMutateHelper();
const watchHelper = useWatchHelper();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();
const notationStore = useNotationStore();

const screenHelper = usescreenHelper();

let annotaionValue = ref("");

const selectedNotation = computed(() =>
  notationStore.getSelectedNotations()?.length == 0
    ? null
    : (notationStore
        .getSelectedNotations()
        .at(0) as AnnotationNotationAttributes),
);


const show = computed(
  () => editModeStore.getEditMode() === "ANNOTATION_WRITING",
);

const annotationTop = computed(
  () => annotationPoint.value.y
);

const annotationLeft = computed(
  () =>annotationPoint.value.x
);

const annotationWidth = computed(() => cellStore.getCellHorizontalWidth());

const annotationHeight = computed(
  () => cellStore.getCellVerticalHeight() / 2 + 2,
);


const annotationPoint = ref({ x: -1, y: -1 });

watchHelper.watchEndOfEditMode(["ANNOTATION_WRITING"],[],  save);

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

watchHelper.watchMouseEvent(
  ["ANNOTATION_SELECTED"],
  "EV_SVG_MOUSEDOWN",
  editSelectedAnnotation,
);


function startTextEditing(e: MouseEvent) {
  annotationPoint.value = {
    x: e.pageX,
    y: e.pageY,
  };

  editModeStore.setNextEditMode();
  setInitialTextValue();
  setTimeout('document.getElementById("annotationEl").focus()', 100);
}

function editSelectedAnnotation() {
  editModeStore.setEditMode("ANNOTATION_WRITING");

  setInitialTextValue();

  hideTextNotation(selectedNotation.value!.uuid);

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
    annotaionValue.value = selectedNotation.value.value;
  }
}

function save() {
  editModeStore.setNextEditMode();

  if (selectedNotation.value) {
    selectedNotation.value.value = annotaionValue.value;
    notationMutateHelper.updateNotation(selectedNotation.value);
    restoreTextNotation(selectedNotation.value.uuid);
  } else {
    notationMutateHelper.addAnnotationNotation(
      annotaionValue.value,
      annotationPoint.value,
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
.annotation {
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
