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
    v-if="show"
    @mouseup="mouseup"
  ></v-card>
</template>

<script setup lang="ts">
import { watch, computed, ref } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import * as d3 from "d3";
import useMatrixHelper from "../helpers/matrixHelper";
import useSelectionHelper from "../helpers/selectionHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useEventBus from "../helpers/eventBusHelper";
import useStateMachine from "../helpers/stateMachine";
import { CellCoordinates } from "common/globals";

const eventBus = useEventBus();
const notationStore = useNotationStore();
const matrixHelper = useMatrixHelper();
const notationMutateHelper = useNotationMutateHelper();
const stateMachine = useStateMachine();
const selectionHelper = useSelectionHelper();

const props = defineProps({
  svgId: { type: String, default: "" },
});

//let selectionMode: AreaSelectionMode = "SELECTING";

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
  () => eventBus.bus.value.get("svgmousedown"),
  (e: MouseEvent) => {
    handleMouseDown(e);

    ///TODO- embed     selectionHelper.activateClickedObject(e);
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

watch(
  () => notationStore.getSelectedCell() as CellCoordinates,
  (
    newSelectedCell: CellCoordinates,
    oldSelectedCell: CellCoordinates | undefined,
  ) => {
    if (!newSelectedCell) return;

    selectionHelper.showSelectedCell(
      props.svgId,
      oldSelectedCell,
      newSelectedCell,
    );
  },
  { immediate: true, deep: true },
);

function mouseup(e: KeyboardEvent) {
  eventBus.emit("svgmouseup", e);
}

/// TODO send to event helper
function keyUp(e: KeyboardEvent) {
  if (e.code === "Backspace" || e.code === "Delete") {
    // actual deletion is handled by eventManager
    resetSelection();
  }
}

function handleMouseDown(e: MouseEvent) {
  if (e.buttons !== 1) {
    return;
  }

  selectionHelper.resetSelection();

  if (notationStore.getEditMode() == "SELECT") {
    stateMachine.setNextEditMode();
    return;
  }

  selectionHelper.selectClickedObject(e);
}

function handleMouseMove(e: MouseEvent) {
  if (e.buttons !== 1) {
    return;
  }

  const editMode = notationStore.getEditMode();

  if (editMode == "SELECTING") {
    updateSelectionArea(e);
    return;
  }

  if (editMode === "MOVING") {
    moveSelection(e);
    return;
  }
}

function handleMouseUp(e: MouseEvent) {
  const editMode = notationStore.getEditMode();

  if (!notationStore.isSelectionMode()) {
    return;
  }

  if (editMode == "SELECTING") {
    endSelect();
    stateMachine.setNextEditMode();
    return;
  }

  if (editMode == "MOVING") {
    endMoveSelection(e);
    stateMachine.setNextEditMode();
    return;
  }

  resetSelection();
}

function noramalizeLeft(value: number) {
  return (
    svgDimensions.value.x +
    Math.floor((value - svgDimensions.value.x) / matrixHelper.getRectSize()) *
      matrixHelper.getRectSize()
  );
}

function noramalizeTop(value: number) {
  return (
    svgDimensions.value.y +
    Math.floor((value - svgDimensions.value.y) / matrixHelper.getRectSize()) *
      matrixHelper.getRectSize()
  );
}

function noramalizeRight(value: number) {
  return (
    svgDimensions.value.x +
    Math.ceil((value - svgDimensions.value.x) / matrixHelper.getRectSize()) *
      matrixHelper.getRectSize()
  );
}

function noramalizeBottom(value: number) {
  return (
    svgDimensions.value.y +
    Math.ceil((value - svgDimensions.value.y) / matrixHelper.getRectSize()) *
      matrixHelper.getRectSize()
  );
}

function normalizeSelection() {
  selectionPosition.value.x1 = noramalizeLeft(selectionPosition.value.x1);
  selectionPosition.value.y1 = noramalizeTop(selectionPosition.value.y1);
  selectionPosition.value.x2 = noramalizeRight(selectionPosition.value.x2);
  selectionPosition.value.y2 = noramalizeBottom(selectionPosition.value.y2);
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
  //notationStore.resetEditMode();
  if (selectionPosition.value.x2 != selectionPosition.value.x1) {
    //normalizeSelection();

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
  notationMutateHelper.updateSelectedNotationCoordinates();
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

  notationStore.resetEditMode();
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
