<template>
  <div v-if="show">
    <v-card
      id="lineLeftHandle"
      class="lineHandle"
      v-bind:style="{
        left: handleLeft + 'px',
        top: handleY + 'px',
      }"
      v-on:mouseup="onMouseUp"
      v-on:mousedown="onHandleMouseDown"
      v-if="!sqrtEditMode"
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
        class="line"
      />
    </svg>
    <p
      class="sqrtsymbol"
      v-bind:style="{
        left: sqrtLeft + 'px',
        top: sqrtY + 'px',
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
import { useCellStore } from "../store/pinia/cellStore";
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
const cellStore = useCellStore();
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

const lineStyle = computed(() => {
  return 'style="stroke: black"';
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

function svgDimensions(): DOMRect | undefined {
  return document.getElementById(props.svgId)?.getBoundingClientRect();
}

let lineLeft = computed(() => {
  return linePosition.value.x1 + (sqrtEditMode.value ? 10 : 0);
});

let lineRight = computed(() => {
  return linePosition.value.x2;
});

let lineY = computed(() => {
  return linePosition.value.y;
});

let handleLeft = computed(() => {
  return lineLeft.value + (svgDimensions()?.left ?? 0) - 10;
});

let sqrtLeft = computed(() => {
  return linePosition.value.x1 + (svgDimensions()?.left ?? 0) - 10;
});

let sqrtY = computed(() => {
  return lineY.value + (svgDimensions()?.top ?? 0) - 5;
});

let handleRight = computed(() => {
  return lineRight.value + (svgDimensions()?.left ?? 0) + 10;
});

let handleY = computed(() => {
  return lineY.value + (svgDimensions()?.top ?? 0) - 5;
});

watch(
  () => eventBus.bus.value.get("SVG_MOUSEUP"),
  () => {
    onMouseUp();
  },
);

watch(
  () => eventBus.bus.value.get("SVG_MOUSEMOVE"),
  (e: MouseEvent) => {
    onMouseMove(e);
  },
);

watch(
  () => eventBus.bus.value.get("SVG_MOUSEDOWN"),
  (e: MouseEvent) => {
    onMouseDown(e);
  },
);

watch(
  () => eventBus.bus.value.get("HORIZONTAL_LINE_SELECTED"),
  (line: HorizontalLineNotationAttributes) => {
    if (line) onLineSelected(line);
  },
);

// event handlers

function onLineSelected(lineNotation: HorizontalLineNotationAttributes) {
  // set selection line

  linePosition.value.x1 =
    lineNotation.fromCol * (cellStore.getCellHorizontalWidth() + cellSpace);
  (linePosition.value.x2 =
    (lineNotation.toCol - 1) *
    (cellStore.getCellHorizontalWidth() + cellSpace)),
    (linePosition.value.y =
      lineNotation.row * (cellStore.getCellVerticalHeight() + cellSpace));

  // update store
  notationStore.selectNotation(lineNotation.uuid);

  // to enable re selection
  eventBus.emit("HORIZONTAL_LINE_SELECTED", null);
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
  if (
    editModeStore.isHorizontalLineStartedMode() ||
    editModeStore.isSqrtStartedMode()
  ) {
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
  const modifyRight =
    linePosition.value.x2 - xPos < xPos - linePosition.value.x1;

  if (modifyRight) {
    linePosition.value.x2 = xPos;
  } else {
    // modify left
    linePosition.value.x1 = xPos;
  }
}

function endDrawLine() {
  if (linePosition.value.x2 == linePosition.value.x1) {
    return;
  }

  let fromCol = Math.round(
    linePosition.value.x1 /
      (cellStore.getCellHorizontalWidth() + cellSpace),
  );

  let toCol = Math.round(
    linePosition.value.x2 /
      (cellStore.getCellHorizontalWidth() + cellSpace),
  );

  let row = Math.round(
    linePosition.value.y / (cellStore.getCellVerticalHeight() + cellSpace),
  );

  saveLine({ fromCol: fromCol, toCol: toCol, row: row });

  editModeStore.setDefaultEditMode();
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
  editModeStore.setDefaultEditMode();
}

function getNearestRow(clickedYPos: number) {
  let clickedRow = Math.round(
    clickedYPos / (cellStore.getCellVerticalHeight() + cellSpace),
  );
  return clickedRow * (cellStore.getCellVerticalHeight() + cellSpace);
}
</script>
