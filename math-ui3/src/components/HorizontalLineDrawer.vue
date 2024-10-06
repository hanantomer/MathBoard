<template>
  <div v-if="show">
    <v-card
      id="lineLeftHandle"
      class="lineHandle"
      v-bind:style="{
        left: handleLeft + 'px',
        top: handleY + 'px',
      }"
      v-on:mouseup="endDrawLine"
      v-on:mousedown="startDrawLine"
      v-if="!sqrtEditMode"
    ></v-card>
    <v-card
      id="lineRightHandle"
      class="lineHandle"
      v-bind:style="{
        left: handleRight + 'px',
        top: handleY + 'px',
      }"
      v-on:mouseup="endDrawLine"
      v-on:mousedown="startDrawLine"
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
  </div>
</template>
<script setup lang="ts">
import useNotationMutateHelper from "../helpers/notationMutateHelper";

import { computed, ref } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { cellSpace } from "../../../math-common/src/globals";

import { HorizontaLinePosition } from "../../../math-common/src/baseTypes";

import {
  HorizontalLineAttributes,
  HorizontalLineNotationAttributes,
} from "../../../math-common/src/baseTypes";

import useWatchHelper from "../helpers/watchHelper";

const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();
const watchHelper = useWatchHelper();

// vars

let linePosition = ref(<HorizontaLinePosition>{
  x1: 0,
  x2: 0,
  y: 0,
});

// computed

const sqrtEditMode = computed(() => {
  return editModeStore.isSqrtEditMode();
});

const show = computed(() => {
  return (
    editModeStore.isHorizontalLineDrawingMode() ||
    editModeStore.isHorizontalLineSelectedMode()
  );
});

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
  return lineLeft.value + (cellStore.getSvgBoundingRect().left ?? 0) - 10;
});

let handleRight = computed(() => {
  return lineRight.value + (cellStore.getSvgBoundingRect().left ?? 0) + 10;
});

let handleY = computed(() => {
  return lineY.value + (cellStore.getSvgBoundingRect().top ?? 0) - 5;
});

// watchers

watchHelper.watchMouseEvent(
  ["HORIZONTAL_LINE_STARTED"],
  "EV_SVG_MOUSEDOWN",
  startDrawLine,
);

watchHelper.watchMouseEvent(
  ["HORIZONTAL_LINE_DRAWING"],
  "EV_SVG_MOUSEMOVE",
  setLine,
);

watchHelper.watchMouseEvent(
  ["HORIZONTAL_LINE_DRAWING"],
  "EV_SVG_MOUSEUP",
  endDrawLine,
);

// emmited by selection helper
watchHelper.watchNotationSelection(
  "HORIZONTAL_LINE_SELECTED",
  "EV_HORIZONTAL_LINE_SELECTED",
  selectLine,
);

watchHelper.watchMouseEvent(
  ["HORIZONTAL_LINE_SELECTED"],
  "EV_SVG_MOUSEDOWN",
  resetLineDrawing,
);

// meethds

function selectLine(lineNotation: HorizontalLineNotationAttributes) {
  if (!lineNotation) return;

  linePosition.value.x1 =
    lineNotation.fromCol * (cellStore.getCellHorizontalWidth() + cellSpace);
  (linePosition.value.x2 =
    (lineNotation.toCol - 1) *
    (cellStore.getCellHorizontalWidth() + cellSpace)),
    (linePosition.value.y =
      lineNotation.row * (cellStore.getCellVerticalHeight() + cellSpace));

  // update store
  notationStore.selectNotation(lineNotation.uuid);
}

function startDrawLine(e: MouseEvent) {
  editModeStore.setNextEditMode();

  if (linePosition.value.x1) return;

  const position = {
    x: e.pageX - cellStore.getSvgBoundingRect().x,
    y: e.pageY - cellStore.getSvgBoundingRect().y,
  };

  linePosition.value.x1 = position.x;

  linePosition.value.x2 = linePosition.value.x1 + 10;

  linePosition.value.y = getNearestRow(position.y);
}

function setLine(e: MouseEvent) {
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

  const xPos = e.pageX - cellStore.getSvgBoundingRect().x;

  const modifyRight = xPos >= linePosition.value.x1;

  if (modifyRight) {
    linePosition.value.x2 = xPos;
  } else {
    // modify left
    linePosition.value.x1 = xPos;
  }
}

function endDrawLine() {
  if (
    linePosition.value.x1 === 0 &&
    linePosition.value.x2 === 0 &&
    linePosition.value.y === 0
  ) {
    return;
  }

  if (linePosition.value.x2 == linePosition.value.x1) {
    return;
  }

  let fromCol = Math.round(
    linePosition.value.x1 / (cellStore.getCellHorizontalWidth() + cellSpace),
  );

  let toCol = Math.round(
    linePosition.value.x2 / (cellStore.getCellHorizontalWidth() + cellSpace),
  );

  let row = Math.round(
    linePosition.value.y / (cellStore.getCellVerticalHeight() + cellSpace),
  );

  saveLine({ fromCol: fromCol, toCol: toCol, row: row });

  resetLineDrawing();
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
