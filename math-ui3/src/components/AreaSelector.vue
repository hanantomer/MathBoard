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
    v-on:mouseenter="enter"
    v-on:mouseleave="leave"
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
import { MoveDirection } from "common/unions";
import { cellSpace } from "common/globals";
import { RectCoordinates, DotCoordinates } from "common/baseTypes";
import useEventBusHelper from "../helpers/eventBusHelper";

const eventBus = useEventBusHelper();
const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationStore = useNotationStore();
const notationMutationHelper = useNotationMutateHelper();
const selectionHelper = useSelectionHelper();

// variables

let mouseOverSelectionArea: boolean = false;
let mouseLeftSelectionArea: boolean = false;

let selectionPosition = ref<RectCoordinates>({
  topLeft: { x: 0, y: 0 },
  bottomRight: { x: 0, y: 0 },
});

let dragPosition = ref<DotCoordinates>({
  x: 0,
  y: 0,
});

// computed

const show = computed(() => {
  return (
    editModeStore.isAreaSelectionOrMovingMode() &&
    selectionPosition.value.topLeft.x !=
      selectionPosition.value.bottomRight.x &&
    selectionPosition.value.topLeft.y != selectionPosition.value.bottomRight.y
  );
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

// area selection watchers

watch(
  () => eventBus.get("SYMBOL", "EV_SVG_MOUSEMOVE"),
  (e: MouseEvent) => {
    if (e.buttons !== 1) return;
    cancelSelection();
    editModeStore.setEditMode("AREA_SELECTING");
  },
);

watch(
  () => eventBus.get("CELL_SELECTED", "EV_SVG_MOUSEMOVE"),
  (e: MouseEvent) => {
    if (e.buttons !== 1) return;
    cancelSelection();
    editModeStore.setEditMode("AREA_SELECTING");
  },
);

watch(
  () => eventBus.get("AREA_SELECTING", "EV_SVG_MOUSEMOVE"),
  (e: MouseEvent) => {
    updateSelectionArea(e);
  },
);

watch(
  () => eventBus.get("AREA_SELECTING", "EV_SVG_MOUSEMOVE"),
  async (e: MouseEvent) => {
    updateSelectionArea(e);
  },
);

watch(
  () => eventBus.get("AREA_SELECTING", "EV_SVG_MOUSEUP"),
  () => {
    endSelect();
  },
);

watch(
  () => eventBus.get("AREA_SELECTED", "EV_KEYUP"),
  async (e: KeyboardEvent) => {
    await handlKeyUp(e);
  },
);

watch(
  () => eventBus.get("AREA_SELECTED", "EV_SVG_MOUSEMOVE"),
  (e: MouseEvent) => {
    startMoving(e);
  },
);

watch(
  () => eventBus.get("AREA_MOVING", "EV_SVG_MOUSEMOVE"),
  async (e: MouseEvent) => {
    await moveSelectionByMouseDrag(e);
  },
);

watch(
  () => eventBus.get("AREA_MOVING", "EV_SVG_MOUSEUP"),
  async (e: MouseEvent) => {
    await endMoveSelection(e);
  },
);

watch(
  () => eventBus.get("AREA_SELECTED", "EV_SVG_MOUSEUP"),
  () => {
    if (!mouseLeftSelectionArea) return;
    cancelSelection();
    editModeStore.setDefaultEditMode();
  },
);

watch(
  () => eventBus.get("SYMBOL", "EV_SVG_MOUSEUP"),
  () => {
    cancelSelection();
  },
);

// free text watchers

watch(
  () => eventBus.get("TEXT_AREA_SELECTING", "EV_SVG_MOUSEMOVE"),
  async (e: MouseEvent) => {
    updateSelectionArea(e);
  },
);

watch(
  () => eventBus.get("TEXT_AREA_SELECTING", "EV_SVG_MOUSEUP"),
  () => {
    endSelect();
    signalSelection();
  },
);

// annotation watchers

watch(
  () => eventBus.get("ANNOTATION_AREA_SELECTING", "EV_SVG_MOUSEMOVE"),
  async (e: MouseEvent) => {
    updateSelectionArea(e);
  },
);

watch(
  () => eventBus.get("ANNOTATION_AREA_SELECTING", "EV_SVG_MOUSEUP"),
  () => {
    endSelect();
  },
);

// event handlers

function startMoving(e: MouseEvent) {
  if (e.buttons !== 1) return;
  if (!mouseOverSelectionArea) return;
  editModeStore.setNextEditMode();
}

function enter() {
  mouseOverSelectionArea = true;
  mouseLeftSelectionArea = false;
}

function leave() {
  mouseLeftSelectionArea = true;
}

/*
function handleMouseUp(e: MouseEvent) {
  const editMode = editModeStore.getEditMode();

  if (editMode == "TEXT_STARTED" || editMode == "ANNOTATION_STARTED") {
    editModeStore.setNextEditMode();
    return;
  }

  if (editMode == "MOVING") {
    endMoveSelection(e);
    editModeStore.setNextEditMode();
    return;
  }

  if (editMode == "AREA_SELECTING") {
    endSelect();
    mouseOverSelectionArea = false; // expect to move the mouse over the selection area at start
    mouseLeftSelectionArea = false;
    editModeStore.setNextEditMode();
    return;
  }

  if (editMode == "AREA_SELECTED" && mouseLeftSelectionArea) {
    editModeStore.setNextEditMode();
    return;
  }

  if (
    editMode === "TEXT_AREA_SELECTING" ||
    editMode === "ANNOTATION_AREA_SELECTING"
  ) {
    editModeStore.setNextEditMode();
    eventBus.emit("EV_SELECTION_DONE", {
      left: selectionRectLeft.value,
      top: selectionRectTop.value,
      width: selectionRectWidth.value,
      height: selectionRectHeight.value,
    });
    return;
  }
}
*/

function mouseup(e: MouseEvent) {
  eventBus.emit("EV_SVG_MOUSEUP", e);
}

function mousemove(e: MouseEvent) {
  eventBus.emit("EV_SVG_MOUSEMOVE", e);
}

async function handlKeyUp(e: KeyboardEvent) {
  if (selectionRectHeight.value === 0) return;

  switch (e.code) {
    case "Delete":
       notationMutationHelper.deleteSelectedNotations();
       editModeStore.setDefaultEditMode();
    case "ArrowLeft":
      if (!notationMutationHelper.moveSelectedNotations(-1, 0, e.ctrlKey)) return;
      await moveSelectionByKey(-1, 0);
      await notationMutationHelper.saveMovedNotations("LEFT");
      break;
    case "ArrowRight":
      if (!notationMutationHelper.moveSelectedNotations(1, 0, e.ctrlKey)) return;
      moveSelectionByKey(1, 0);
      await notationMutationHelper.saveMovedNotations("RIGHT");
      break;
    case "ArrowDown":
      if (!notationMutationHelper.moveSelectedNotations(0, 1, e.ctrlKey)) return;
      moveSelectionByKey(0, 1);
      await notationMutationHelper.saveMovedNotations("BOTTOM");
      break;
    case "ArrowUp":
      if (!notationMutationHelper.moveSelectedNotations(0, -1, e.ctrlKey)) return;
      moveSelectionByKey(0, -1);
      await notationMutationHelper.saveMovedNotations("TOP");
      break;
  }
}

// extend or shrink selection area following inner mouse move
function updateSelectionArea(e: MouseEvent) {
  if (e.buttons !== 1) return;
  if (selectionPosition.value.topLeft.x == 0) {
    selectionPosition.value.topLeft.x = e.pageX;
    selectionPosition.value.topLeft.y = e.pageY;
  }

  selectionPosition.value.bottomRight.x = e.pageX;
  selectionPosition.value.bottomRight.y =
    editModeStore.getEditMode() === "ANNOTATION_AREA_SELECTING"
      ? selectionPosition.value.topLeft.y + 20
      : e.pageY;
  cellStore.resetSelectedCell();
}

function endSelect() {
  // select cell if seelection is too small
  if (
    Math.abs(
      selectionPosition.value.topLeft.x - selectionPosition.value.bottomRight.x,
    ) < 5 ||
    Math.abs(
      selectionPosition.value.topLeft.y - selectionPosition.value.bottomRight.y,
    ) < 5
  ) {
    selectionHelper.selectCell({
      x: selectionPosition.value.topLeft.x,
      y: selectionPosition.value.topLeft.y,
    });
    return;
  }

  selectionHelper.selectNotationsOfArea(selectionPosition.value);
  editModeStore.setNextEditMode();
}

function moveSelectionByMouseDrag(e: MouseEvent) {
  if (!mouseOverSelectionArea) return;
  if (mouseLeftSelectionArea) return;

  // initial drag position
  if (!dragPosition.value.x) {
    dragPosition.value.x = e.pageX;
    dragPosition.value.y = e.pageY;
    return;
  }

  // movement is still too small

  if (
    Math.abs(e.pageX - dragPosition.value.x) <
      cellStore.getCellHorizontalWidth() + cellSpace &&
    Math.abs(e.pageY - dragPosition.value.y) <
      cellStore.getCellVerticalHeight() + cellSpace
  ) {
    return;
  }

  const rectDeltaX = Math.round(
    (e.pageX - dragPosition.value.x) /
      (cellStore.getCellHorizontalWidth() + cellSpace),
  );

  const rectDeltaY = Math.round(
    (e.pageY - dragPosition.value.y) /
      (cellStore.getCellVerticalHeight() + cellSpace),
  );

  if (rectDeltaX != 0 || rectDeltaY != 0) {
    notationMutationHelper.moveSelectedNotations(
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

    dragPosition.value.x = e.pageX;
    dragPosition.value.y = e.pageY;
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

  await notationMutationHelper.saveMovedNotations(moveDirection);
  notationStore.resetSelectedNotations();
  cancelSelection();
  editModeStore.setDefaultEditMode();
}

function cancelSelection() {
  //if (!mouseLeftSelectionArea) return;
  console.debug("cancelSelection");
  dragPosition.value.x =
    dragPosition.value.y =
    selectionPosition.value.topLeft.x =
    selectionPosition.value.bottomRight.x =
    selectionPosition.value.topLeft.y =
    selectionPosition.value.bottomRight.y =
      0;
  notationStore.resetSelectedNotations();
  //editModeStore.setDefaultEditMode();
}

function signalSelection() {
  editModeStore.setNextEditMode();
  eventBus.emit("EV_AREA_SELECTION_DONE", {
    left: selectionRectLeft.value,
    top: selectionRectTop.value,
    width: selectionRectWidth.value,
    height: selectionRectHeight.value,
  });
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
