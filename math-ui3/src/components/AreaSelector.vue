<template>
  <v-card
    id="selection"
    class="selection"
    v-bind:style="{
      left: selectionRectLeft + 'px',
      top: selectionRectTop + 'px',
      width: selectionRectWidth + 'px',
      height: selectionRectHeight + 'px',
    }"
    v-if="show"
  ></v-card>
</template>

<script setup lang="ts">
import { watch, computed, ref } from "vue";
import { AreaSelectionMode } from "../../../math-common/src/unions";
import { useNotationStore } from "../store/pinia/notationStore";
import * as d3 from "d3";
import useMatrixHelper from "../helpers/matrixHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useEventBus from "../helpers/eventBus";
import UseUserOutgoingOperationsSyncHelper from "../helpers/userOutgoingOperationsHelper";

const eventBus = useEventBus();
const notationStore = useNotationStore();
const matrixHelper = useMatrixHelper();
const notationMutateHelper = useNotationMutateHelper();
const userOutgoingOperationsSyncHelper = UseUserOutgoingOperationsSyncHelper();

const props = defineProps({
  svgId: { type: String, default: "" },
});

let selectionMode: AreaSelectionMode = "SELECTING";

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
    if (notationStore.getEditMode().value == "SELECT") {
      handleMouseMove(e);
    }
  },
);

watch(
  () => eventBus.bus.value.get("svgmouseup"),
  (e: MouseEvent) => {
    handleMouseUp(e);
  },
);

function keyUp(e: KeyboardEvent) {
  if (e.code === "Backspace" || e.code === "Delete") {
    // actual deletion is handled by eventManager
    resetSelection();
  }
}

function handleMouseMove(e: MouseEvent) {
  if (e.buttons !== 1) {
    return;
  }

  if (notationStore.getEditMode().value != "SELECT") {
    return;
  }

  if (selectionMode == "SELECTING") {
    updateSelectionArea(e);
    return;
  }

  if (selectionMode === "MOVE") {
    moveSelection(e);
    return;
  }
}

function handleMouseUp(e: MouseEvent) {
  if (notationStore.getEditMode().value !== "SELECT") {
    return;
  }
  if (selectionMode === "SELECTING") {
    endSelect();
    return;
  }
  if (selectionMode === "MOVE") {
    endMoveSelection(e);
    return;
  }

  resetSelection();
}

function noramalizeLeftOrTop(value: number) {
  return (
    Math.floor(value / matrixHelper.getRectSize()) * matrixHelper.getRectSize()
  );
}

function noramalizeRightOrBottom(value: number) {
  return (
    Math.ceil(value / matrixHelper.getRectSize()) * matrixHelper.getRectSize()
  );
}

function normalizeSelection() {
  selectionPosition.value.x1 = noramalizeLeftOrTop(selectionPosition.value.x1);
  selectionPosition.value.y1 = noramalizeLeftOrTop(selectionPosition.value.y1);
  selectionPosition.value.x2 = noramalizeRightOrBottom(
    selectionPosition.value.x2,
  );
  selectionPosition.value.y2 = noramalizeRightOrBottom(
    selectionPosition.value.y2,
  );
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
  selectionMode = "MOVE";
  if (selectionPosition.value.x2 != selectionPosition.value.x1) {
    normalizeSelection();

    d3.select("#" + props.svgId)
      .selectAll("foreignObject")
      .each((datum: any) => {
        let row = datum.row ?? datum.fromRow;
        let col = datum.col ?? datum.fromCol;
        if (
          matrixHelper.getRectSize() * col + svgDimensions.value.x >=
            selectionPosition.value.x1 &&
          matrixHelper.getRectSize() * col + svgDimensions.value.x <=
            selectionPosition.value.x2 &&
          matrixHelper.getRectSize() * row + svgDimensions.value.y >=
            selectionPosition.value.y1 &&
          matrixHelper.getRectSize() * row + svgDimensions.value.y <=
            selectionPosition.value.y2
        ) {
          notationMutateHelper.selectNotation({
            col: col,
            row: row,
          });
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
      matrixHelper.getRectSize() &&
    Math.abs(e.clientY - svgDimensions.value.y - dragPosition.value.y) <
      matrixHelper.getRectSize()
  ) {
    return;
  }

  const rectDeltaX = Math.round(
    (e.clientX - svgDimensions.value.x - dragPosition.value.x) /
      matrixHelper.getRectSize(),
  );
  const rectDeltaY = Math.round(
    (e.clientY - svgDimensions.value.y - dragPosition.value.y) /
      matrixHelper.getRectSize(),
  );

  if (rectDeltaX != 0 || rectDeltaY != 0) {
    notationMutateHelper.moveSelectedNotations(rectDeltaX, rectDeltaY);

    selectionPosition.value.x1 += rectDeltaX * matrixHelper.getRectSize();
    selectionPosition.value.y1 += rectDeltaY * matrixHelper.getRectSize();
    selectionPosition.value.x2 += rectDeltaX * matrixHelper.getRectSize();
    selectionPosition.value.y2 += rectDeltaY * matrixHelper.getRectSize();
    dragPosition.value.x = e.clientX - svgDimensions.value.x;
    dragPosition.value.y = e.clientY - svgDimensions.value.y;
  }
}

function endMoveSelection(e: MouseEvent) {
  //let selectedNotationKeys = notationStore.getSelectedNotations();
  notationMutateHelper.updateSelectedNotationCoordinates();
  notationStore.getSelectedNotations().forEach((notation) => {
    if (notation) {
      userOutgoingOperationsSyncHelper.syncOutgoingUpdateSelectedNotation(
        notation,
      );
    }
  });
  resetSelection();
}

function resetSelection() {
  dragPosition.value.x = 0;
  dragPosition.value.y = 0;
  selectionPosition.value.x1 =
    selectionPosition.value.x2 =
    selectionPosition.value.y1 =
    selectionPosition.value.y2 =
      0;
  selectionMode = "SELECTING";
  notationStore.getEditMode().value = "SYMBOL";
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
