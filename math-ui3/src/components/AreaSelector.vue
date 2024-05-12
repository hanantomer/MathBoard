<template>
  <v-card
    variant="outlined"
    id="selection"
    class="selection"
    v-bind:style="{
      left: selectionRectLeft + 'px',
      top: selectionRectTop + 'px',
      width: selectionRectWidth + 'px',
      height: selectionRectHeight + 'px',
    }"
    v-on:mouseup="mouseup"
    v-on:mousemove="mousemove"
    v-if="show"
  ></v-card>
</template>

<script setup lang="ts">
import { watch, computed, ref } from "vue";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useNotationStore } from "../store/pinia/notationStore";

import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useSelectionHelper from "../helpers/selectionHelper";
import useEventBus from "../helpers/eventBusHelper";
import { MoveDirection } from "common/unions";
import { cellSpace } from "common/globals";

const eventBus = useEventBus();
const editModeStore = useEditModeStore();
const notationStore = useNotationStore();
const notationMutateHelper = useNotationMutateHelper();
const selectionHelper = useSelectionHelper();

const props = defineProps({
  svgId: { type: String, default: "" },
});

let selectionPosition = ref({
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
});

let dragPosition = ref({
  x: 0,
  y: 0,
});

const show = computed(() => {
  return (
    editModeStore.isAreaSelectionOrMovingMode() &&
    selectionPosition.value.x1 != selectionPosition.value.x2 &&
    selectionPosition.value.y1 != selectionPosition.value.y2
  );
});

const svgDimensions = computed(() => {
  return document.getElementById(props.svgId)?.getBoundingClientRect()!;
});

const selectionRectLeft = computed(() => {
  return Math.min(selectionPosition.value.x1, selectionPosition.value.x2);
});

const selectionRectTop = computed(() => {
  return Math.min(selectionPosition.value.y1, selectionPosition.value.y2);
});

const selectionRectWidth = computed(() => {
  return (
    Math.max(selectionPosition.value.x1, selectionPosition.value.x2) -
    Math.min(selectionPosition.value.x1, selectionPosition.value.x2)
  );
});

const selectionRectHeight = computed(() => {
  return (
    Math.max(selectionPosition.value.y1, selectionPosition.value.y2) -
    Math.min(selectionPosition.value.y1, selectionPosition.value.y2)
  );
});

// emitted by eventHelper
watch(
  () => eventBus.bus.value.get("KEYUP"),
  async (e: KeyboardEvent) => {
    await keyUp(e);
  },
);

watch(
  () => eventBus.bus.value.get("SVG_MOUSEMOVE"),
  (e: MouseEvent) => {
    handleMouseMove(e);
  },
);

watch(
  () => eventBus.bus.value.get("SVG_MOUSEUP"),
  (e: MouseEvent) => {
    handleMouseUp(e);
  },
);

// watch(
//   () => eventBus.bus.value.get("SVG_MOUSEDOWN"),
//   (e: MouseEvent) => {
//     handleMouseDown(e);
//   },
// );

function mouseup(e: MouseEvent) {
  eventBus.emit("SVG_MOUSEUP", e);
}

function mousemove(e: MouseEvent) {
  eventBus.emit("SVG_MOUSEMOVE", e);
}

async function keyUp(e: KeyboardEvent) {
  if (selectionRectHeight.value === 0) return;

  switch (e.code) {
    case "ArrowLeft":
      if (!notationMutateHelper.moveSelectedNotations(-1, 0, e.ctrlKey)) return;
      await moveSelectionByKey(-1, 0);
      await notationMutateHelper.saveMovedNotations("LEFT");
      break;
    case "ArrowRight":
      if (!notationMutateHelper.moveSelectedNotations(1, 0, e.ctrlKey)) return;
      moveSelectionByKey(1, 0);
      await notationMutateHelper.saveMovedNotations("RIGHT");
      break;
    case "ArrowDown":
      if (!notationMutateHelper.moveSelectedNotations(0, 1, e.ctrlKey)) return;
      moveSelectionByKey(0, 1);
      await notationMutateHelper.saveMovedNotations("BOTTOM");
      break;
    case "ArrowUp":
      if (!notationMutateHelper.moveSelectedNotations(0, -1, e.ctrlKey)) return;
      moveSelectionByKey(0, -1);
      await notationMutateHelper.saveMovedNotations("TOP");
      break;
  }
}

async function moveSelectionByKey(
  moveHorizontal: number,
  moveVertical: number,
) {
  selectionPosition.value.x1 +=
    moveHorizontal * (notationStore.getCellHorizontalWidth() + cellSpace);
  selectionPosition.value.y1 +=
    moveVertical * (notationStore.getCellVerticalHeight() + cellSpace);
  selectionPosition.value.x2 +=
    moveHorizontal * (notationStore.getCellHorizontalWidth() + cellSpace);
  selectionPosition.value.y2 +=
    moveVertical * notationStore.getCellVerticalHeight() + cellSpace;
}

function handleMouseMove(e: MouseEvent) {
  if (e.buttons !== 1) {
    return;
  }

  const editMode = editModeStore.getEditMode();

  if (
    editModeStore.isLineMode() ||
    editModeStore.isSqrtMode() ||
    editModeStore.isColorisingMode()
  ) {
    return;
  }

  notationStore.resetSelectedCell();

  //if (editMode === "AREA_SELECTED" || editMode === "TEXT_AREA_SELECTED") {
  //  editModeStore.setNextEditMode(); // => moving
  //  return;
  //}

  if (editMode === "AREA_SELECTING" || editMode === "TEXT_AREA_SELECTING") {
    updateSelectionArea(e); // =>area selected
    return;
  }

  if (editMode === "MOVING") {
    moveSelection(e);
    return;
  }

  if (editMode === "TEXT") {
    editModeStore.setEditMode("TEXT_AREA_SELECTING");
  } else {
    editModeStore.setEditMode("AREA_SELECTING");
  }
}

//function handleMouseDown(e: MouseEvent) {
//  resetSelection();
//}

function handleMouseUp(e: MouseEvent) {
  const editMode = editModeStore.getEditMode();

  if (editMode == "MOVING") {
    endMoveSelection(e);
    editModeStore.setNextEditMode();
    return;
  }

  if (editMode == "AREA_SELECTING") {
    endSelect();
    editModeStore.setNextEditMode();
    return;
  }

  if (editMode == "TEXT_AREA_SELECTING") {
    editModeStore.setNextEditMode();
    eventBus.bus.value.set("SELECTION_DONE", selectionPosition.value);
    return;
  }

  resetSelection();
}

// extend or shrink selection area following inner mouse move
function updateSelectionArea(e: MouseEvent) {
  if (selectionPosition.value.x1 == 0) {
    selectionPosition.value.x1 = e.clientX;
    selectionPosition.value.y1 = e.clientY;
  }

  selectionPosition.value.x2 = e.clientX;
  selectionPosition.value.y2 = e.clientY;
}

function endSelect() {
  selectionHelper.selectNotationsOfArea(props.svgId, selectionPosition.value);
}

function moveSelection(e: MouseEvent) {
  // initial drag position
  if (!dragPosition.value.x) {
    dragPosition.value.x = e.clientX - svgDimensions.value.left;
    dragPosition.value.y = e.clientY - svgDimensions.value.top;
    return;
  }

  // movement is still too small
  if (
    Math.abs(e.clientX - svgDimensions.value.x - dragPosition.value.x) <
      notationStore.getCellHorizontalWidth() + cellSpace &&
    Math.abs(e.clientY - svgDimensions.value.y - dragPosition.value.y) <
      notationStore.getCellVerticalHeight() + cellSpace
  ) {
    return;
  }

  const rectDeltaX = Math.round(
    (e.clientX - svgDimensions.value.x - dragPosition.value.x) /
      (notationStore.getCellHorizontalWidth() + cellSpace),
  );

  const rectDeltaY = Math.round(
    (e.clientY - svgDimensions.value.y - dragPosition.value.y) /
      (notationStore.getCellVerticalHeight() + cellSpace),
  );

  if (rectDeltaX != 0 || rectDeltaY != 0) {
    notationMutateHelper.moveSelectedNotations(
      rectDeltaX,
      rectDeltaY,
      e.ctrlKey,
    );

    selectionPosition.value.x1 +=
      rectDeltaX * (notationStore.getCellHorizontalWidth() + cellSpace);
    selectionPosition.value.y1 +=
      rectDeltaY * (notationStore.getCellVerticalHeight() + cellSpace);
    selectionPosition.value.x2 +=
      rectDeltaX * (notationStore.getCellHorizontalWidth() + cellSpace);
    selectionPosition.value.y2 +=
      rectDeltaY * (notationStore.getCellVerticalHeight() + cellSpace);

    dragPosition.value.x = e.clientX - svgDimensions.value.x;
    dragPosition.value.y = e.clientY - svgDimensions.value.y;
  }
}

async function endMoveSelection(e: MouseEvent) {
  const moveDirection: MoveDirection =
    e.movementX > 0 && e.movementY > 0
      ? "RIGHTBOTTOM"
      : e.movementX > 0 && e.movementY < 0
      ? "RIGHTTOP"
      : e.movementX > 0 && e.movementY === 0
      ? "RIGHT"
      : e.movementX < 0 && e.movementY > 0
      ? "LEFTBOTTOM"
      : e.movementX < 0 && e.movementY < 0
      ? "LEFTTOP"
      : "LEFT";

  await notationMutateHelper.saveMovedNotations(moveDirection);
  notationStore.resetSelectedNotations();
  resetSelection();
}

function resetSelection() {
  dragPosition.value.x =
    dragPosition.value.y =
    selectionPosition.value.x1 =
    selectionPosition.value.x2 =
    selectionPosition.value.y1 =
    selectionPosition.value.y2 =
      0;
}
</script>

<style>
.selection {
  cursor: move; /*fallback if grab cursor is unsupported */
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
  position: absolute;
  z-index: 99;
  background: transparent !important;
  border: 1, 1, 1, 1;
}
</style>
