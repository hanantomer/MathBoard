<template>
  <input
    v-show="show"
    class="annotation"
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
let annotaionValue = ref("");

const cellStore = useCellStore();
const emit = defineEmits(["hide"]);
const editModeStore = useEditModeStore();

const screenHelper = usescreenHelper();

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

const annotationWidth = computed(() => cellStore.getCellHorizontalWidth() + 2);

const annotationHeight = computed(
  () => cellStore.getCellVerticalHeight() / 2 + 2,
);

let selectedNotation: PointNotationAttributes | null = null;

let annotationCell = ref({ col: 10, row: 10 });

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
  annotationCell.value = screenHelper.getClickedCell({
    x: e.pageX,
    y: e.pageY,
  });
  setTimeout('document.getElementById("annotationEl").focus()', 100);
}

function editSelectedAnnotation(annotation: PointNotationAttributes) {
  editModeStore.setEditMode("ANNOTATION_WRITING");

  selectedNotation = annotation;

  setInitialTextValue();

  hideTextNotation(annotation.uuid);

  const textEl = document.getElementById(
    "annotationEl",
  )! as HTMLTextAreaElement;

  setTimeout(() => {
    textEl.focus();
  }, 0);
}

// set text area dimensions upon notation selection
// function setInitialTextDimensions(annotation: PointNotationAttributes) {
//   textLeft.value =
//     cellStore.getSvgBoundingRect().x +
//     window.scrollX +
//     annotation.col * (cellStore.getCellHorizontalWidth() + cellSpace) -
//     cellSpace;

//   textTop.value =
//     cellStore.getSvgBoundingRect().y +
//     window.scrollY +
//     annotation.row * (cellStore.getCellVerticalHeight() + cellSpace) -
//     cellSpace;
// }

function setInitialTextValue() {
  annotaionValue.value = "";
  if (selectedNotation?.value) {
    annotaionValue.value = selectedNotation?.value!;
  }
}

function submitText() {
  editModeStore.setNextEditMode();

  //const annotationEl = document.getElementById("annotationEl")!;

  //textLeft.value = parseInt(annotationEl.style.left.replace("px", ""));
  //textTop.value = parseInt(annotationEl.style.top.replace("px", ""));

  // const cellCoordinates = screenHelper.get LineAttributes({
  //   x1: textLeft.value + window.scrollX - cellStore.getSvgBoundingRect().x,
  //   x2:
  //     textLeft.value +
  //     textWidth +
  //     window.scrollX -
  //     cellStore.getSvgBoundingRect().x,
  //   y: textTop.value + window.scrollY - cellStore.getSvgBoundingRect().y,
  // });

  if (selectedNotation) {
    selectedNotation.value = annotaionValue.value;
    //selectedNotation = Object.assign(selectedNotation, lineCoordinates);

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
.annotation {
  background-color: lightyellow;
  position: absolute;
  padding: 1px;
  font-size: xx-small;
}
input:focus {
  outline-width: 1px;
}

.hidden {
  display: none;
}
</style>
