<template>
  <lineWatcher
    :startEntry="{
      editMode: 'VERTICAL_LINE_STARTED',
      func: setInitialLinePosition,
    }"
    :drawEntry="{
      editMode: 'VERTICAL_LINE_DRAWING',
      func: drawLine,
    }"
    :editEntryFirstHandle="{
      editMode: 'VERTICAL_LINE_EDITING_TOP',
      func: modifyLineTop,
    }"
    :editEntrySecondHandle="{
      editMode: 'VERTICAL_LINE_EDITING_BOTTOM',
      func: modifyLineBottom,
    }"
    :endEntry="{
      editMode: [
        'VERTICAL_LINE_DRAWING',
        'VERTICAL_LINE_EDITING_TOP',
        'VERTICAL_LINE_EDITING_BOTTOM',
        'VERTICAL_LINE_SELECTED',
      ],
      func: endDrawing,
    }"
    :selectEntry="{
      editMode: 'VERTICAL_LINE_SELECTED',
      func: selectLine,
      event: 'EV_VERTICAL_LINE_SELECTED',
    }"
    :moveByKeyEntry="{
      editMode: 'VERTICAL_LINE_SELECTED',
      func: moveLine,
    }"
    :endSelectionEntry="{
      editMode: ['VERTICAL_LINE_SELECTED'],
    }"
  />
  <div v-show="show">
    <line-handle
      drawing-mode="VERTICAL_LINE_DRAWING"
      editing-mode="VERTICAL_LINE_EDITING_TOP"
      v-bind:style="{
        left: handleX + 'px',
        top: handleTop + 'px',
      }"
    ></line-handle>
    <line-handle
      drawing-mode="VERTICAL_LINE_DRAWING"
      editing-mode="VERTICAL_LINE_EDITING_BOTTOM"
      v-bind:style="{
        left: handleX + 'px',
        top: handleBottom + 'px',
      }"
    ></line-handle>
    <svg
      height="800"
      width="1500"
      xmlns="http://www.w3.org/2000/svg"
      class="line-svg"
    >
      <line
        :x1="linePosition.px"
        :y1="linePosition.p1y"
        :x2="linePosition.px"
        :y2="linePosition.p2y"
        class="line"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useScreenHelper from "../helpers/screenHelper";

import lineWatcher from "./LineWatcher.vue";
import { useNotationStore } from "../store/pinia/notationStore";

import {
  VerticalLineNotationAttributes,
  VerticalLineAttributes,
  DotCoordinates,
  NotationAttributes,
} from "../../../math-common/src/baseTypes";
import lineHandle from "./LineHandle.vue";
import { LineHandleType } from "common/unions";

//const watchHelper = useWatchHelper();
//const lineDrawer = useLineDrawer();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();
const screenHelper = useScreenHelper();
const notationStore = useNotationStore();
const notationMutateHelper = useNotationMutateHelper();

// vars

const linePosition = ref<VerticalLineAttributes>({
  px: 0,
  p1y: 0,
  p2y: 0,
});

// computed

const show = computed(() => {
  return (
    editModeStore.isVerticalLineDrawingMode() ||
    editModeStore.isVerticalLineSelectedMode() ||
    editModeStore.isVerticalLineEditingMode()
  );
});

let handleX = computed(() => {
  return linePosition.value.px + (cellStore.getSvgBoundingRect().left ?? 0) - 3;
});

let handleBottom = computed(() => {
  if (!cellStore.getSvgBoundingRect()) return;
  return linePosition.value.p2y + (cellStore.getSvgBoundingRect().top ?? 0) - 3;
});

let handleTop = computed(() => {
  if (!cellStore.getSvgBoundingRect()) return;
  return linePosition.value.p1y + (cellStore.getSvgBoundingRect().top ?? 0);
});

// watchHelper.watchMouseEvent(
//   ["VERTICAL_LINE_SELECTED"],
//   "EV_SVG_MOUSEDOWN",
//   () => lineDrawer.resetDrawing(),
// );

// methods

function setInitialLinePosition(p: DotCoordinates) {
  linePosition.value.px = p.x;
  linePosition.value.p1y = p.y;
  linePosition.value.p2y = p.y;
}

function setY(handleType: LineHandleType, yPos: number) {
  if (handleType === "top") {
    linePosition.value.p1y = yPos;
  } else {
    linePosition.value.p2y = yPos;
  }
}

function drawLine(p: DotCoordinates) {
  const handleType =
    Math.abs(p.y - linePosition.value.p1y) <
    Math.abs(linePosition.value.p2y - p.y)
      ? "top"
      : "bottom";

  setY(handleType, p.y);
}

function modifyLineTop(p: DotCoordinates) {
  setY("top", p.y);
}

function modifyLineBottom(p: DotCoordinates) {
  setY("bottom", p.y);
}

function fixLineTopEdge(linePosition: VerticalLineAttributes) {
  const lineTopPosition = {
    x: linePosition.px,
    y: linePosition.p1y,
  };

  // notation edge at top
  const nearNoatationAtTop =
    screenHelper.getNearestNotationEdge(lineTopPosition);

  if (nearNoatationAtTop != null) {
    linePosition.px = nearNoatationAtTop.x;
    linePosition.p1y = nearNoatationAtTop.y;
  }

  if (nearNoatationAtTop == null) {
    // cell X edge at top
    const nearCellXBorderAtTop =
      screenHelper.getNearestCellXBorder(lineTopPosition);

    if (nearCellXBorderAtTop != null) {
      linePosition.px = nearCellXBorderAtTop;
    }

    // cell Y edge at top
    const nearCellYBorderAtTop =
      screenHelper.getNearestCellYBorder(lineTopPosition);

    if (nearCellYBorderAtTop != null) {
      linePosition.p1y = nearCellYBorderAtTop;
    }
  }
}

function fixLineBottomEdge(linePosition: VerticalLineAttributes) {
  const lineBottomPosition = {
    x: linePosition.px,
    y: linePosition.p2y,
  };

  // notation edge at bottom
  const nearNoatationAtBottom =
    screenHelper.getNearestNotationEdge(lineBottomPosition);

  if (nearNoatationAtBottom != null) {
    linePosition.px = nearNoatationAtBottom.x;
    linePosition.p2y = nearNoatationAtBottom.y;
  }

  if (nearNoatationAtBottom == null) {
    // cell X edge at bottom
    const nearCellXBorderAtBottom =
      screenHelper.getNearestCellXBorder(lineBottomPosition);

    if (nearCellXBorderAtBottom != null) {
      linePosition.px = nearCellXBorderAtBottom;
    }

    // cell Y edge at bottom
    const nearCellYBorderAtBottom =
      screenHelper.getNearestCellYBorder(lineBottomPosition);

    if (nearCellYBorderAtBottom != null) {
      linePosition.p2y = nearCellYBorderAtBottom;
    }
  }
}

function endDrawing() {
  saveVerticalLine();
  resetDrawing();
}

function saveVerticalLine() {

  fixLineBottomEdge(linePosition.value);
  fixLineTopEdge(linePosition.value);

  if (notationStore.getSelectedNotations().length > 0) {
    let updatedLine = {
      ...notationStore.getSelectedNotations().at(0)!,
      ...linePosition.value,
    };

    notationMutateHelper.updateVerticalLineNotation(
      updatedLine as VerticalLineNotationAttributes,
    );
  } else
    notationMutateHelper.addVerticalLineNotation(
      linePosition.value,
      "VERTICALLINE",
    );
}

function resetDrawing() {
  linePosition.value.px = linePosition.value.p1y = linePosition.value.p2y = 0;
}

function selectLine(notation: NotationAttributes) {
  const n = notation as VerticalLineNotationAttributes;

  linePosition.value.px = n.px;
  linePosition.value.p1y = n.p1y;
  linePosition.value.p2y = n.p2y;
}

function moveLine(moveX: number, moveY: number) {
  linePosition.value.px += moveX;
  linePosition.value.p1y += moveY;
  linePosition.value.p2y += moveY;
  saveVerticalLine();
}

</script>
