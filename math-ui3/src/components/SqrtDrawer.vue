<template>
  <div v-if="show">
    <v-card
      id="sqrtRightHandle"
      class="lineHandle"
      v-bind:style="{
        left: handleRight + 'px',
        top: handleY + 'px',
      }"
      v-on:mouseup="onMouseUp"
      v-on:mousedown="onHandleMouseDown"
    ></v-card>
    <svg
      height="800"
      width="1500"
      xmlns="http://www.w3.org/2000/svg"
      style="position: absolute; pointer-events: none"
    >
      <line
        :x1="sqrtLeft"
        :y1="sqrtY"
        :x2="sqrtRight"
        :y2="sqrtY"
        class="line"
      />
    </svg>
    <p
      class="sqrtsymbol"
      v-bind:style="{
        left: sqrtSymbolLeft + 'px',
        top: sqrtSymbolY + 'px',
      }"
    >
      &#x221A;
    </p>
  </div>
</template>
<script setup lang="ts">
import useNotationMutateHelper from "../helpers/notationMutateHelper";

import { watch, computed, ref } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { cellSpace } from "../../../math-common/src/globals";

import {
  HorizontaLinePosition,
  DotCoordinates,
} from "../../../math-common/src/baseTypes";

import {
  HorizontalLineAttributes,
  HorizontalLineNotationAttributes,
} from "../../../math-common/src/baseTypes";
import useEventBus from "../helpers/eventBusHelper";

const eventBus = useEventBus();
const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();


// vars

let sqrtPosition = ref(<HorizontaLinePosition>{
  x1: 0,
  x2: 0,
  y: 0,
});

const show = computed(() => {
  return editModeStore.isSqrtEditMode() || editModeStore.isSqrtSelectedMode();
});

let sqrtRight = computed(() => {
  return sqrtPosition.value.x2;
});

let sqrtLeft = computed(() => {
  return sqrtPosition.value.x1 + cellStore.getCellHorizontalWidth();
});

let sqrtY = computed(() => {
  return sqrtPosition.value.y;
});

let sqrtSymbolLeft = computed(() => {
  return sqrtPosition.value.x1 + (cellStore.getSvgBoundingRect().left ?? 0) - 6;
});

let sqrtSymbolY = computed(() => {
  return sqrtPosition.value.y + (cellStore.getSvgBoundingRect().top ?? 0) - 5;
});

let handleRight = computed(() => {
  return sqrtRight.value + (cellStore.getSvgBoundingRect().left ?? 0) + 10;
});

let handleY = computed(() => {
  return sqrtY.value + (cellStore.getSvgBoundingRect().top ?? 0) - 5;
});

watch(
  () => eventBus.bus.value.get("EV_SVG_MOUSEUP"),
  () => {
    onMouseUp();
  },
);

watch(
  () => eventBus.bus.value.get("EV_SVG_MOUSEMOVE"),
  (e: MouseEvent) => {
    onMouseMove(e);
  },
);

watch(
  () => eventBus.bus.value.get("EV_SVG_MOUSEDOWN"),
  (e: MouseEvent) => {
    onMouseDown(e);
  },
);

watch(
  () => eventBus.bus.value.get("EV_SQRT_SELECTED"),
  (sqrt: HorizontalLineNotationAttributes) => {
    if (sqrt) onSqerSelected(sqrt);
  },
);

// event handlers

function onSqerSelected(sqrtNotation: HorizontalLineNotationAttributes) {
  // set selection sqrt

  sqrtPosition.value.x1 =
    sqrtNotation.fromCol * (cellStore.getCellHorizontalWidth() + cellSpace);
  (sqrtPosition.value.x2 =
    (sqrtNotation.toCol - 1) *
    (cellStore.getCellHorizontalWidth() + cellSpace)),
    (sqrtPosition.value.y =
      sqrtNotation.row * (cellStore.getCellVerticalHeight() + cellSpace));

  // update store
  notationStore.selectNotation(sqrtNotation.uuid);

  // to enable re selection
  eventBus.emit("EV_SQRT_SELECTED", null);
}

function onHandleMouseDown() {
  editModeStore.setNextEditMode();
}

// emitted by event manager
function onMouseDown(e: MouseEvent) {
  if (e.buttons !== 1) {
    // ignore right button
    return;
  }

  // user clicked elsewere after start drawing
  if (editModeStore.isSqrtDrawingMode()) {
    resetSqrtDrawing();
  }

  // new sqrt
  if (editModeStore.isSqrtStartedMode()) {
    startSqrtDrawing({
      x: e.pageX - cellStore.getSvgBoundingRect().x,
      y: e.pageY - cellStore.getSvgBoundingRect().y,
    });
    editModeStore.setNextEditMode();
  }
}

function onMouseMove(e: MouseEvent) {
  // ignore right button
  if (e.buttons !== 1) {
    return;
  }

  // nothing done yet
  if (
    sqrtPosition.value.x1 === 0 &&
    sqrtPosition.value.x2 === 0 &&
    sqrtPosition.value.y === 0
  ) {
    return;
  }

  if (!editModeStore.isSqrtDrawingMode()) {
    return;
  }
  setSqrt(e.offsetX);
}

function onMouseUp() {
  // drawing not started
  if (
    sqrtPosition.value.x1 === 0 &&
    sqrtPosition.value.x2 === 0 &&
    sqrtPosition.value.y === 0
  ) {
    return;
  }

  // sqrt yet not modified
  if (editModeStore.isSqrtDrawingMode()) {
    endDrawSqrt();
  }
}

// methods

function startSqrtDrawing(position: DotCoordinates) {
  sqrtPosition.value.x1 = position.x;

  sqrtPosition.value.x2 = sqrtPosition.value.x1 + 10;

  sqrtPosition.value.y = getNearestRow(position.y);
}

function setSqrt(xPos: number) {
  sqrtPosition.value.x2 = xPos;
}

function endDrawSqrt() {
  if (sqrtPosition.value.x2 == sqrtPosition.value.x1) {
    return;
  }

  let fromCol = Math.round(
    sqrtPosition.value.x1 / (cellStore.getCellHorizontalWidth() + cellSpace),
  );

  let toCol = Math.round(
    sqrtPosition.value.x2 / (cellStore.getCellHorizontalWidth() + cellSpace),
  );

  let row = Math.round(
    sqrtPosition.value.y / (cellStore.getCellVerticalHeight() + cellSpace),
  );

  saveSqrt({ fromCol: fromCol, toCol: toCol, row: row });

  editModeStore.setDefaultEditMode();
}

function saveSqrt(sqrtAttributes: HorizontalLineAttributes) {
  if (notationStore.getSelectedNotations().length > 0) {
    let updatedLine = {
      ...notationStore.getSelectedNotations().at(0)!,
      ...sqrtAttributes,
    };

    notationMutateHelper.updateHorizontalLineNotation(
      updatedLine as HorizontalLineNotationAttributes,
    );
  } else
    notationMutateHelper.addHorizontalLineNotation(
      sqrtAttributes,
      editModeStore.getNotationTypeByEditMode(),
    );
}

function resetSqrtDrawing() {
  sqrtPosition.value.x1 = sqrtPosition.value.x2 = sqrtPosition.value.y = 0;
  editModeStore.setDefaultEditMode();
}

function getNearestRow(clickedYPos: number) {
  let clickedRow = Math.round(
    clickedYPos / (cellStore.getCellVerticalHeight() + cellSpace),
  );
  return clickedRow * (cellStore.getCellVerticalHeight() + cellSpace);
}
</script>
