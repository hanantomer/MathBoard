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
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";

import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useSelectionHelper from "../helpers/selectionHelper";
import useEventBus from "../helpers/eventBusHelper";
import { MoveDirection } from "common/unions";
import { cellSpace } from "common/globals";
import { RectCoordinates, DotCoordinates } from "common/baseTypes";

const eventBus = useEventBus();
const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationStore = useNotationStore();
const notationMutateHelper = useNotationMutateHelper();
const selectionHelper = useSelectionHelper();

const props = defineProps({
  svgId: { type: String, default: "" },
});

let selectionPosition = ref<RectCoordinates>({
  topLeft: { x: 0, y: 0 },
  bottomRight: { x: 0, y: 0 },
});

let dragPosition = ref<DotCoordinates>({
  x: 0,
  y: 0,
});

const show = computed(() => {
  return (
    editModeStore.isAreaSelectionOrMovingMode() &&
    selectionPosition.value.topLeft.x !=
      selectionPosition.value.bottomRight.x &&
    selectionPosition.value.topLeft.y != selectionPosition.value.bottomRight.y
  );
});

const svgDimensions = computed(() => {
  return document.getElementById(props.svgId)?.getBoundingClientRect()!;
});

const selectionRectLeft = computed(() => {
  return Math.min(
    selectionPosition.value.topLeft.x,
    selectionPosition.value.bottomRight.x,
  );
});

const selectionRectTop = computed(() => {
  return Math.min(
    selectionPosition.value.topLeft.y,
    selectionPosition.value.bottomRight.y,
  );
});

const selectionRectWidth = computed(() => {
  return (
    Math.max(
      selectionPosition.value.topLeft.x,
      selectionPosition.value.bottomRight.x,
    ) -
    Math.min(
      selectionPosition.value.topLeft.x,
      selectionPosition.value.bottomRight.x,
    )
  );
});

const selectionRectHeight = computed(() => {
  return (
    Math.max(
      selectionPosition.value.topLeft.y,
      selectionPosition.value.bottomRight.y,
    ) -
    Math.min(
      selectionPosition.value.topLeft.y,
      selectionPosition.value.bottomRight.y,
    )
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
  () => eventBus.bus.value.get("SVG_MOUSEDOWN"),
  (e: MouseEvent) => {
    handleMouseDown(e);
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
  selectionPosition.value.topLeft.x +=
    moveHorizontal * (cellStore.getCellHorizontalWidth() + cellSpace);
  selectionPosition.value.topLeft.y +=
    moveVertical * (cellStore.getCellVerticalHeight() + cellSpace);
  selectionPosition.value.bottomRight.x +=
    moveHorizontal * (cellStore.getCellHorizontalWidth() + cellSpace);
  selectionPosition.value.bottomRight.y +=
    moveVertical * cellStore.getCellVerticalHeight() + cellSpace;
}

function handleMouseDown(e: MouseEvent) {
  if (e.buttons !== 1) {
    return;
  }

  if (editModeStore.isTextStartedMode()) {
    selectionPosition.value.topLeft.x = e.clientX;
    selectionPosition.value.topLeft.y = e.clientY;
    selectionPosition.value.bottomRight.x = e.clientX + 25;
    selectionPosition.value.bottomRight.y = e.clientY + 25;
  }
}

function handleMouseMove(e: MouseEvent) {
  if (e.buttons !== 1) {
    return;
  }

  const editMode = editModeStore.getEditMode();

  if (
    editModeStore.isLineMode() ||
    editModeStore.isSqrtMode() ||
    editModeStore.isCurveMode() ||
    editModeStore.isColorisingMode() ||
    editModeStore.isTextWritingMode()
  ) {
    return;
  }

  cellStore.resetSelectedCell();

  if (editMode === "AREA_SELECTING" || editMode === "TEXT_AREA_SELECTING") {
    updateSelectionArea(e); // =>area selected
    return;
  }

  if (editMode === "MOVING") {
    moveSelection(e);
    return;
  }

  if (editMode === "TEXT_STARTED") {
    editModeStore.setEditMode("TEXT_AREA_SELECTING");
  } else {
    editModeStore.setEditMode("AREA_SELECTING");
  }
}

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
    eventBus.emit("SELECTION_DONE", {
      left: selectionRectLeft.value,
      top: selectionRectTop.value,
      width: selectionRectWidth.value,
      height: selectionRectHeight.value,
    });
    return;
  }

  resetSelection();
}

// extend or shrink selection area following inner mouse move
function updateSelectionArea(e: MouseEvent) {
  if (selectionPosition.value.topLeft.x == 0) {
    selectionPosition.value.topLeft.x = e.clientX;
    selectionPosition.value.topLeft.y = e.clientY;
  }

  selectionPosition.value.bottomRight.x = e.clientX;
  selectionPosition.value.bottomRight.y = e.clientY;
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
      cellStore.getCellHorizontalWidth() + cellSpace &&
    Math.abs(e.clientY - svgDimensions.value.y - dragPosition.value.y) <
      cellStore.getCellVerticalHeight() + cellSpace
  ) {
    return;
  }

  const rectDeltaX = Math.round(
    (e.clientX - svgDimensions.value.x - dragPosition.value.x) /
      (cellStore.getCellHorizontalWidth() + cellSpace),
  );

  const rectDeltaY = Math.round(
    (e.clientY - svgDimensions.value.y - dragPosition.value.y) /
      (cellStore.getCellVerticalHeight() + cellSpace),
  );

  if (rectDeltaX != 0 || rectDeltaY != 0) {
    notationMutateHelper.moveSelectedNotations(
      rectDeltaX,
      rectDeltaY,
      e.ctrlKey,
    );

    selectionPosition.value.topLeft.x +=
      rectDeltaX * (cellStore.getCellHorizontalWidth() + cellSpace);
    selectionPosition.value.topLeft.y +=
      rectDeltaY * (cellStore.getCellVerticalHeight() + cellSpace);
    selectionPosition.value.bottomRight.x +=
      rectDeltaX * (cellStore.getCellHorizontalWidth() + cellSpace);
    selectionPosition.value.bottomRight.y +=
      rectDeltaY * (cellStore.getCellVerticalHeight() + cellSpace);

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
    selectionPosition.value.topLeft.x =
    selectionPosition.value.bottomRight.x =
    selectionPosition.value.topLeft.y =
    selectionPosition.value.bottomRight.y =
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
