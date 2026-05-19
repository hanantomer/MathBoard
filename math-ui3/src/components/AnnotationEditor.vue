<template>
  <input
    data-cy="annotationEditor"
    v-show="show"
    class="annotation"
    maxlength="6"
    v-bind:style="{
      top: annotationTop + 'px',
      left: annotationLeft + 'px',
      width: annotationWidth + 'px',
      height: annotationHeight + 'px',
      transform: `rotate(${rotation}deg)`,
      transformOrigin: 'center center',
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
import { AnnotationNotationAttributes } from "common/baseTypes";
import { decodeSpecialSymbol } from "common/globals";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useWatchHelper from "../helpers/watchHelper";

const notationMutateHelper = useNotationMutateHelper();
const watchHelper = useWatchHelper();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();
const notationStore = useNotationStore();

let annotaionValue = ref("");

const selectedNotation = computed(() =>
  notationStore.getSelectedNotations()?.length == 0
    ? null
    : (notationStore
        .getSelectedNotations()
        .at(0) as AnnotationNotationAttributes),
);

const rotation = computed(() => selectedNotation.value?.rotation ?? 0);

const show = computed(
  () => editModeStore.getEditMode() === "ANNOTATION_WRITING",
);

const annotationTop = computed(() => annotationPoint.value.y);

const annotationLeft = computed(() => annotationPoint.value.x);

const annotationWidth = computed(() => cellStore.getCellHorizontalWidth() * 2);

const annotationHeight = computed(
  () => cellStore.getCellVerticalHeight() / 2 + 2,
);

const annotationPoint = ref({ x: -1, y: -1 });

watchHelper.watchEndOfEditMode(["ANNOTATION_WRITING"], [], save);

watchHelper.watchPointerEvent(
  ["ANNOTATION_STARTED", "ANNOTATION_SELECTED"],
["EV_SVG_POINTERDOWN"],
  startTextEditing,
);

watchHelper.watchKeyEvent(
  ["ANNOTATION_WRITING"],
  "EV_KEYUP",
  endEditingByEnterKey,
);

watchHelper.watchPointerEvent(
  ["ANNOTATION_WRITING"],
  ["EV_SVG_POINTERDOWN"],
  editModeStore.setDefaultEditMode,
);

watchHelper.watchPointerEvent(
  ["ANNOTATION_SELECTED"],
  ["EV_SVG_POINTERDOWN"],
  editSelectedAnnotation,
);

watchHelper.watchCustomEvent(
  ["ANNOTATION_WRITING"],
  "EV_SPECIAL_SYMBOL_SELECTED",
  addSpecialSymbol,
);

// Reset sketch points when switching away from FREE_SKETCH global mode
watchHelper.watchGlobalEditModeChange((newMode, oldMode) => {
  if (oldMode === "ANNOTATION" && newMode !== "ANNOTATION") {
    // Reset sketch points when leaving FREE_SKETCH mode
    save();
    annotaionValue.value = "";
  }
});

function startTextEditing(e: PointerEvent) {
  // ANNOTATION_SELECTED uses a separate handler on the same event.
  if (editModeStore.getEditMode() === "ANNOTATION_SELECTED") {
    return;
  }

  const svgId = cellStore.getSvgId();
  const boardSvg = svgId ? document.getElementById(svgId) : null;
  if (!boardSvg?.contains(e.target as Node)) {
    return;
  }

  // Matrix cells use pointer-events: none, so the target is usually <svg>, <g>,
  // or notation markup — not <rect>. Accept any click inside the board SVG.

  annotationPoint.value = {
    x: e.clientX,
    y: e.clientY - 7,
  };

  editModeStore.setEditMode("ANNOTATION_WRITING");
  setInitialTextValue();
  setTimeout(() => {
    document.getElementById("annotationEl")?.focus();
  }, 100);
}

function editSelectedAnnotation() {
  editModeStore.setEditMode("ANNOTATION_WRITING");

  setInitialTextValue();

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

async function save() {
  if (editModeStore.getGlobalEditMode() === "ANNOTATION") {
    editModeStore.setEditMode("ANNOTATION_STARTED");
  }
  //else {
  //  editModeStore.setDefaultEditMode();
  //}

  if (selectedNotation.value) {
    selectedNotation.value.value = annotaionValue.value;
    await notationMutateHelper.updateNotation(selectedNotation.value);
    restoreTextNotation(selectedNotation.value.uuid);
  } else {
    const r = cellStore.getSvgBoundingRect();
    notationMutateHelper.addAnnotationNotation(annotaionValue.value, {
      x: annotationPoint.value.x - r.left,
      y: annotationPoint.value.y - r.top + 7,
    });
    //.then((uuid) => {
    //  selectCreatedAnnotation(uuid);
    //});
  }
  annotaionValue.value = "";
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
    editModeStore.setDefaultEditMode();
  }
}

function addSpecialSymbol(symbol: string): void {
  if (!symbol) return;
  const input = document.getElementById("annotationEl") as HTMLInputElement;

  // Get cursor position
  const start = input.selectionStart || 1;
  const end = input.selectionEnd || 6;

  const decodedSymbol = decodeSpecialSymbol(symbol);

  // Insert decoded symbol at cursor position
  annotaionValue.value =
    input.value.substring(0, start) +
    decodedSymbol +
    input.value.substring(end);

  // Reset cursor position after symbol
  setTimeout(() => {
    input.focus();
    input.setSelectionRange(
      start + decodedSymbol.length,
      start + decodedSymbol.length,
    );
  }, 0);
}

// function selectCreatedAnnotation(uuid: string | undefined | null) {
//   if (!uuid) return;
//   notationStore.selectNotation(uuid);
//   editModeStore.setEditMode("ANNOTATION_SELECTED");
// }
</script>
<style>
.annotation {
  border: none;
  outline: none;
  background-color: rgb(216, 216, 79);
  position: fixed;
  padding: 0px;
  font-size: 0.5em;
}

.hidden {
  display: none;
}
</style>
