<template>
  <lineWatcher
    :startEntry="{
      editMode: 'HORIZONTAL_LINE_STARTED',
      func: setInitialLinePosition,
    }"
    :drawEntry="{
      editMode: 'HORIZONTAL_LINE_DRAWING',
      func: drawLine,
    }"
    :editEntryFirstHandle="{
      editMode: 'HORIZONTAL_LINE_EDITING_LEFT',
      func: modifyLineLeft,
    }"
    :editEntrySecondHandle="{
      editMode: 'HORIZONTAL_LINE_EDITING_RIGHT',
      func: modifyLineRight,
    }"
    :endEntry="{
      editMode: [
        'HORIZONTAL_LINE_DRAWING',
        'HORIZONTAL_LINE_EDITING_RIGHT',
        'HORIZONTAL_LINE_EDITING_LEFT',
        'HORIZONTAL_LINE_SELECTED',
      ],
      func: saveLine,
    }"
    :selectEntry="{
      editMode: 'HORIZONTAL_LINE_SELECTED',
      func: selectLine,
      event: 'EV_HORIZONTAL_LINE_SELECTED',
    }"
    :resetSelectionEntry="{
      editMode: [
        'HORIZONTAL_LINE_EDITING_RIGHT',
        'HORIZONTAL_LINE_EDITING_LEFT',
        'HORIZONTAL_LINE_SELECTED',
      ],
      func: resetDrawing,
    }"
  />
  <div v-if="show">
    <line-handle
      drawing-mode="HORIZONTAL_LINE_DRAWING"
      editing-mode="HORIZONTAL_LINE_EDITING_LEFT"
      v-bind:style="{
        left: handleLeft + 'px',
        top: handleY + 'px',
      }"
    >
    </line-handle>

    <line-handle
      drawing-mode="HORIZONTAL_LINE_DRAWING"
      editing-mode="HORIZONTAL_LINE_EDITING_RIGHT"
      v-bind:style="{
        left: handleRight + 'px',
        top: handleY + 'px',
      }"
    >
    </line-handle>
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
import { computed, ref } from "vue";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useNotationStore } from "../store/pinia/notationStore";
import {
  HorizontalLineAttributes,
  HorizontalLineNotationAttributes,
  DotCoordinates,
  NotationAttributes,
} from "../../../math-common/src/baseTypes";
import lineHandle from "./LineHandle.vue";
import lineWatcher from "./LineWatcher.vue";

import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useScreenHelper from "../helpers/screenHelper";

const cellStore = useCellStore();
const editModeStore = useEditModeStore();
const notationStore = useNotationStore();

const notationMutateHelper = useNotationMutateHelper();
const screenHelper = useScreenHelper();

// vars

const linePosition = ref<HorizontalLineAttributes>({
  p1x: 0,
  p2x: 0,
  py: 0,
});

// computed

const show = computed(() => {
  const show = (
    editModeStore.isHorizontalLineDrawingMode() ||
    editModeStore.isHorizontalLineSelectedMode() ||
    editModeStore.isHorizontalLineEditingMode()
  );

  //if (!show) {
  //  resetDrawing();
  //}

  return show;
});

let lineLeft = computed(() => {
  return linePosition.value.p1x;
});

let lineRight = computed(() => {
  return linePosition.value.p2x;
});

let lineY = computed(() => {
  return linePosition.value.py;
});

let handleLeft = computed(() => {
  return lineLeft.value + (cellStore.getSvgBoundingRect().left ?? 0) - 1;
});

let handleRight = computed(() => {
  return lineRight.value + (cellStore.getSvgBoundingRect().left ?? 0) + 1;
});

let handleY = computed(() => {
  return lineY.value + (cellStore.getSvgBoundingRect().top ?? 0) - 1;
});

// methods
function setInitialLinePosition(p: DotCoordinates) {
  linePosition.value.p1x = p.x;
  linePosition.value.p2x = p.x;
  linePosition.value.py = p.y;
}

function drawLine(p: DotCoordinates) {
  //const xPos = getX(e);
  const modifyRight = p.x >= linePosition.value.p1x;

  if (modifyRight) {
    linePosition.value.p2x = p.x;
  } else {
    // modify left
    linePosition.value.p1x = p.x;
  }
}

function modifyLineLeft(p: DotCoordinates) {
  linePosition.value.p1x = p.x;
}


function modifyLineRight(p: DotCoordinates) {
  linePosition.value.p2x = p.x;
}


function saveLine() {
  fixLineEdge(linePosition.value);

  if (notationStore.getSelectedNotations().length > 0) {
    let updatedLine = {
      ...notationStore.getSelectedNotations().at(0)!,
      ...linePosition.value,
    };

    notationMutateHelper.updateHorizontalLineNotation(updatedLine);
  } else {
    notationMutateHelper.addHorizontalLineNotation(
      linePosition.value,
      "HORIZONTALLINE",
    );
  }
}

function fixLineEdge(linePosition: HorizontalLineAttributes) {
  const nearLineRightEdge = screenHelper.getCloseLineEdge({
    x: linePosition.p1x,
    y: linePosition.py,
  });

  if (nearLineRightEdge != null) {
    linePosition.p1x = nearLineRightEdge.x;
    linePosition.py = nearLineRightEdge.y;
  }

  const nearLineLeftEdge = screenHelper.getCloseLineEdge({
    x: linePosition.p2x,
    y: linePosition.py,
  });

  if (nearLineLeftEdge != null) {
    linePosition.p2x = nearLineLeftEdge.x;
    linePosition.py = nearLineLeftEdge.y;
  }
}

function resetDrawing() {
  linePosition.value.p1x = linePosition.value.p2x = linePosition.value.py = 0;
}

function selectLine(notation: NotationAttributes) {
  const n = notation as HorizontalLineNotationAttributes;

  linePosition.value.p1x = n.p1x;
  linePosition.value.p2x = n.p2x;
  linePosition.value.py = n.py;
}

</script>
