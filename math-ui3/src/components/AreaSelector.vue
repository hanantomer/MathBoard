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
import * as d3 from "d3";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useEventBus from "../helpers/eventBusHelper";
import { NotationTypeShape, MoveDirection } from "common/unions";

const eventBus = useEventBus();
const editModeStore = useEditModeStore();
const notationStore = useNotationStore();
const notationMutateHelper = useNotationMutateHelper();

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
  () => eventBus.bus.value.get("keyup"),
  (e: KeyboardEvent) => {
    keyUp(e);
  },
);

watch(
  () => eventBus.bus.value.get("svgmousemove"),
  (e: MouseEvent) => {
    handleMouseMove(e);
  },
);

watch(
  () => eventBus.bus.value.get("svgmouseup"),
  (e: MouseEvent) => {
    handleMouseUp(e);
  },
);

function mouseup(e: MouseEvent) {
  eventBus.emit("svgmouseup", e);
}

function mousemove(e: MouseEvent) {
  eventBus.emit("svgmousemove", e);
}

async function keyUp(e: KeyboardEvent) {
  if (selectionRectHeight.value === 0) return;

  switch (e.code) {
    case "ArrowLeft":
      notationMutateHelper.moveSelectedNotations(-1, 0);
      moveSelectionByKey(-1, 0);
      break;
    case "ArrowRight":
      notationMutateHelper.moveSelectedNotations(1, 0);
      moveSelectionByKey(1, 0);
      break;
    case "ArrowDown":
      notationMutateHelper.moveSelectedNotations(0, 1);
      moveSelectionByKey(0, 1);
      break;
    case "ArrowUp":
      notationMutateHelper.moveSelectedNotations(0, -1);
      moveSelectionByKey(0, -1);
      break;
  }

  switch (e.code) {
    case "ArrowLeft":
      await notationMutateHelper.updateSelectedNotationCoordinates("LEFT");
      break;
    case "ArrowRight":
      await notationMutateHelper.updateSelectedNotationCoordinates("RIGHT");
      break;
    case "ArrowDown":
      await notationMutateHelper.updateSelectedNotationCoordinates("BOTTOM");
      break;
    case "ArrowUp":
      await notationMutateHelper.updateSelectedNotationCoordinates("TOP");
      break;
  }
}

function moveSelectionByKey(moveHorizontal: number, moveVertical: number) {
  selectionPosition.value.x1 +=
    moveHorizontal * notationStore.getCellHorizontalWidth();
  selectionPosition.value.y1 +=
    moveVertical * notationStore.getCellVerticalHeight();
  selectionPosition.value.x2 +=
    moveHorizontal * notationStore.getCellHorizontalWidth();
  selectionPosition.value.y2 +=
    moveVertical * notationStore.getCellVerticalHeight();
}

function handleMouseMove(e: MouseEvent) {
  if (e.buttons !== 1) {
    return;
  }

  const editMode = editModeStore.getEditMode();

  if (editMode == "AREA_SELECTED") {
    editModeStore.setNextEditMode();
    return;
  }

  if (editMode == "AREA_SELECTING") {
    updateSelectionArea(e);
    return;
  }

  if (editMode === "MOVING") {
    moveSelection(e);
    return;
  }
}

function handleMouseUp(e: MouseEvent) {
  const editMode = editModeStore.getEditMode();

  if (editMode == "AREA_SELECTING") {
    endSelect();
    editModeStore.setNextEditMode();
    return;
  }

  if (editMode == "MOVING") {
    endMoveSelection(e);
    editModeStore.setNextEditMode();
    return;
  }

  resetSelection();
}

// extend or shrink selection area from inner mouse move
function updateSelectionArea(e: MouseEvent) {
  // normalize selection position to edges of rectangle
  if (selectionPosition.value.x1 == 0) {
    selectionPosition.value.x1 = e.clientX;
    selectionPosition.value.y1 = e.clientY;
  }

  selectionPosition.value.x2 = e.clientX;
  selectionPosition.value.y2 = e.clientY;
}

function endSelect() {
  if (selectionPosition.value.x2 != selectionPosition.value.x1) {
    //normalizeSelection();

    d3.select("#" + props.svgId)
      .selectAll("foreignObject")
      .each((datum: any) => {
        let row = datum.row ?? datum.fromRow;
        let col = datum.col ?? datum.fromCol;

        let y_gutter = 10;

        if (
          NotationTypeShape.get(datum.notationType) === "LINE" ||
          datum.notationType === "SQRTSYMBOL"
        ) {
          y_gutter = 0;
        }

        const x_gutter = 10;

        if (
          selectionPosition.value.x1 <=
            notationStore.getCellHorizontalWidth() * col +
              x_gutter +
              svgDimensions.value.x &&
          selectionPosition.value.x2 >=
            notationStore.getCellHorizontalWidth() * (col + 1) -
              x_gutter +
              svgDimensions.value.x &&
          selectionPosition.value.y1 <=
            notationStore.getCellVerticalHeight() * row +
              y_gutter +
              svgDimensions.value.y &&
          selectionPosition.value.y2 >=
            notationStore.getCellVerticalHeight() * (row + 1) -
              y_gutter +
              svgDimensions.value.y
        ) {
          notationMutateHelper.selectNotation(datum.uuid);
        }
      });
  }
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
      notationStore.getCellHorizontalWidth() &&
    Math.abs(e.clientY - svgDimensions.value.y - dragPosition.value.y) <
      notationStore.getCellVerticalHeight()
  ) {
    return;
  }

  const rectDeltaX = Math.round(
    (e.clientX - svgDimensions.value.x - dragPosition.value.x) /
      notationStore.getCellHorizontalWidth(),
  );
  const rectDeltaY = Math.round(
    (e.clientY - svgDimensions.value.y - dragPosition.value.y) /
      notationStore.getCellVerticalHeight(),
  );

  if (rectDeltaX != 0 || rectDeltaY != 0) {
    notationMutateHelper.moveSelectedNotations(rectDeltaX, rectDeltaY);

    selectionPosition.value.x1 +=
      rectDeltaX * notationStore.getCellHorizontalWidth();
    selectionPosition.value.y1 +=
      rectDeltaY * notationStore.getCellVerticalHeight();
    selectionPosition.value.x2 +=
      rectDeltaX * notationStore.getCellHorizontalWidth();
    selectionPosition.value.y2 +=
      rectDeltaY * notationStore.getCellVerticalHeight();
    dragPosition.value.x = e.clientX - svgDimensions.value.x;
    dragPosition.value.y = e.clientY - svgDimensions.value.y;
  }
}

function endMoveSelection(e: MouseEvent) {
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

  notationMutateHelper.updateSelectedNotationCoordinates(moveDirection);
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
