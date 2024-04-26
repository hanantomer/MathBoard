<template>
  <div v-show="show">
    <v-card
      id="lineLeftHandle"
      class="lineHandle"
      v-bind:style="{
        left: handleLeft + 'px',
        top: handleY + 'px',
      }"
      v-on:mouseup="onMouseUp"
      v-on:mousedown="onHandleMouseDown"
    ></v-card>
    <v-card
      id="lineRightHandle"
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
        :x1="lineLeft"
        :y1="lineY"
        :x2="lineRight"
        :y2="lineY"
        style="stroke: gray; stroke-width: 2"
      />
    </svg>
    <p
      style="position: absolute"
      class="sqrtsymbol"
      v-bind:style="{
        left: lineLeft - 11 + 'px',
        top: lineY + 'px',
      }"
      v-if="sqrtEditMode"
    >
      &#x221A;
    </p>
  </div>
</template>
<script setup lang="ts">
import useNotationMutateHelper from "../helpers/notationMutateHelper";

import { watch, computed, ref } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import {
  HorizontaLinePosition,
  DotPosition,
  cellSpace,
} from "../../../math-common/src/globals";
import {
  HorizontalLineAttributes,
  HorizontalLineNotationAttributes,
} from "../../../math-common/src/baseTypes";
import useEventBus from "../helpers/eventBusHelper";

const eventBus = useEventBus();
const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();

// props

const props = defineProps({
  svgId: { type: String, default: "" },
});

// vars

let linePosition = ref(<HorizontaLinePosition>{
  x1: 0,
  x2: 0,
  y: 0,
});

const sqrtEditMode = computed(() => {
  return editModeStore.isSqrtEditMode();
});

const show = computed(() => {
  return (
    editModeStore.isHorizontalLineDrawingMode() ||
    editModeStore.isHorizontalLineSelectedMode()
  );
});

function svgDimensions() : DOMRect | undefined{
  return document.getElementById(props.svgId)?.getBoundingClientRect();
};

let lineLeft = computed(() => {
  return linePosition.value.x1;
});

let lineRight = computed(() => {
  return linePosition.value.x2;
});

let lineY = computed(() => {
  return linePosition.value.y;
});

let handleLeft = computed(() => {
  return lineLeft.value + (svgDimensions()?.left ?? 0);
});

let handleRight = computed(() => {
  return lineRight.value + (svgDimensions()?.left ?? 0);
});

let handleY = computed(() => {
  return lineY.value + (svgDimensions()?.top ?? 0);
});

watch(
  () => eventBus.bus.value.get("svgmouseup"),
  () => {
    onMouseUp();
  },
);

watch(
  () => eventBus.bus.value.get("svgmousemove"),
  (e: MouseEvent) => {
    onMouseMove(e);
  },
);

watch(
  () => eventBus.bus.value.get("svgmousedown"),
  (e: MouseEvent) => {
    onMouseDown(e);
  },
);

watch(
  () => eventBus.bus.value.get("horizontalLineSelected"),
  (line: HorizontalLineNotationAttributes) => {
    if (line) onLineSelected(line);
  },
  { immediate: true },
);

// event handlers

function onLineSelected(lineNotation: HorizontalLineNotationAttributes) {
  // set selection line

  linePosition.value.x1 =
    lineNotation.fromCol * (notationStore.getCellHorizontalWidth() + cellSpace);
  (linePosition.value.x2 =
    (lineNotation.toCol - 1) *
    (notationStore.getCellHorizontalWidth() + cellSpace)),
    (linePosition.value.y =
      lineNotation.row * (notationStore.getCellVerticalHeight() + cellSpace));

  // update store
  notationStore.selectNotation(lineNotation.uuid);

  // to enable re selection
  eventBus.emit("horizontalLineSelected", null);
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
  if (editModeStore.isHorizontalLineDrawingMode()) {
    resetLineDrawing();
  }

  // new line
  if (editModeStore.isHorizontalLineStartedMode()) {
    startLineDrawing({
      x: e.offsetX,
      y: e.offsetY,
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
    linePosition.value.x1 === 0 &&
    linePosition.value.x2 === 0 &&
    linePosition.value.y === 0
  ) {
    return;
  }

  if (!editModeStore.isHorizontalLineDrawingMode()) {
    return;
  }
  setLine(e.offsetX);
}

function onMouseUp() {
  // drawing not started
  if (
    linePosition.value.x1 === 0 &&
    linePosition.value.x2 === 0 &&
    linePosition.value.y === 0
  ) {
    return;
  }

  // line yet not modified
  if (editModeStore.isHorizontalLineDrawingMode()) {
    endDrawLine();
  }
}

// methods

function startLineDrawing(position: DotPosition) {
  linePosition.value.x1 = position.x;

  linePosition.value.x2 = linePosition.value.x1 + 10;

  linePosition.value.y = getNearestRow(position.y);
}

function setLine(xPos: number) {
  if (xPos > linePosition.value.x1) {
    linePosition.value.x2 = xPos;
  }
}

function endDrawLine() {
  if (linePosition.value.x2 == linePosition.value.x1) {
    return;
  }

  let fromCol = Math.round(
    linePosition.value.x1 /
      (notationStore.getCellHorizontalWidth() + cellSpace),
  );

  let toCol = Math.round(
    linePosition.value.x2 /
      (notationStore.getCellHorizontalWidth() + cellSpace),
  );

  let row = Math.round(
    linePosition.value.y / (notationStore.getCellVerticalHeight() + cellSpace),
  );

  saveLine({ fromCol: fromCol, toCol: toCol, row: row });

  editModeStore.resetEditMode();
}

function saveLine(lineAttributes: HorizontalLineAttributes) {
  if (notationStore.getSelectedNotations().length > 0) {
    let updatedLine = {
      ...notationStore.getSelectedNotations().at(0)!,
      ...lineAttributes,
    };

    notationMutateHelper.updateHorizontalLineNotation(
      updatedLine as HorizontalLineNotationAttributes,
    );
  } else
    notationMutateHelper.addHorizontalLineNotation(
      lineAttributes,
      editModeStore.getNotationTypeByEditMode(),
    );
}

function resetLineDrawing() {
  linePosition.value.x1 = linePosition.value.x2 = linePosition.value.y = 0;
  editModeStore.resetEditMode();
}

function getNearestRow(clickedYPos: number) {
  let clickedRow = Math.round(
    clickedYPos / (notationStore.getCellVerticalHeight() + cellSpace),
  );
  return clickedRow * (notationStore.getCellVerticalHeight() + cellSpace);
}
</script>

<style>
.line {
  top: 4px;
  position: absolute;
  color: black;
  display: block;
  border-bottom: solid 1px;
  border-top: solid 1px;
  z-index: 999;
}
.lineHandle {
  cursor: col-resize;
  display: block;
  position: absolute;
  z-index: 999;
  width: 12px;
  height: 12px;
  border: 1, 1, 1, 1;
}

.sqrtsymbol {
  margin-left: 6px;
  z-index: 999;
  font-weight: bold;
  font-size: 1.8em;
}
</style>
