<template></template>

<script setup lang="ts">
import useWatchHelper from "../helpers/watchHelper";
import useLineDrawer from "../helpers/lineDrawingHelper";
import { PropType } from "vue";

import {
  lineWatcherEntry,
  lineSaveWatcherEntry,
  lineSelectWatcherEntry,
  lineEndSelectionWatcherEntry,
  lineMoveWatcherEntry,
} from "../../../math-common/src/baseTypes";

const lineDrawer = useLineDrawer();
const watchHelper = useWatchHelper();


// each prop entry holds a stage of the line drawing process
const props = defineProps({
  startEntry: {
    type: Object as PropType<lineWatcherEntry>,
    required: true,
  },

  drawEntry: {
    type: Object as PropType<lineWatcherEntry>,
    required: true,
  },

  editEntryFirstHandle: {
    type: Object as PropType<lineWatcherEntry>,
    required: true,
  },

  editEntrySecondHandle: {
    type: Object as PropType<lineWatcherEntry>,
    required: true,
  },

  endEntry: {
    type: Object as PropType<lineSaveWatcherEntry>,
    required: true,
  },

  selectEntry: {
    type: Object as PropType<lineSelectWatcherEntry>,
    required: true,
  },

  moveByKeyEntry: {
    type: Object as PropType<lineMoveWatcherEntry>,
    required: true,
  },

  endSelectionEntry: {
    type: Object as PropType<lineEndSelectionWatcherEntry>,
    required: true,
  },
});

watchHelper.watchMouseEvent(
  props.startEntry.editMode,
  "EV_SVG_MOUSEDOWN",
  (e: MouseEvent) => {
    lineDrawer.setLineInitialPosition(e, props.startEntry.func);
  },
);

watchHelper.watchMouseEvent(
  props.drawEntry.editMode,
  "EV_SVG_MOUSEMOVE",
  (e: MouseEvent) => lineDrawer.drawNewLine(e, props.drawEntry.func),
);

watchHelper.watchMouseEvent(
  props.editEntryFirstHandle.editMode,
  "EV_SVG_MOUSEMOVE",
  (e: MouseEvent) => lineDrawer.modifyLine(e, props.editEntryFirstHandle.func),
);

watchHelper.watchMouseEvent(
  props.editEntrySecondHandle.editMode,
  "EV_SVG_MOUSEMOVE",
  (e: MouseEvent) => lineDrawer.modifyLine(e, props.editEntrySecondHandle.func),
);

watchHelper.watchMouseEvent(props.endEntry.editMode, "EV_SVG_MOUSEUP", () =>
  lineDrawer.endDrawing(props.endEntry.func),
);

watchHelper.watchNotationSelection(
  props.selectEntry.editMode,
  props.selectEntry.event,
  (n) => lineDrawer.selectLine(n, props.selectEntry.func),
);

watchHelper.watchKeyEvent(
  props.selectEntry.editMode,
  "EV_KEYUP",
  (e: KeyboardEvent) => lineDrawer.moveLine(e, props.moveByKeyEntry.func),
);

watchHelper.watchEndOfEditMode(
  ["CURVE_DRAWING",
    "CURVE_EDITING_CONTROLֹ_POINT",
    "CURVE_EDITING_LEFT",
    "CURVE_EDITING_RIGHT",
    "CURVE_SELECTED",
    "SLOPE_LINE_DRAWING",
    "SLOPE_LINE_EDITING_LEFT",
    "SLOPE_LINE_EDITING_RIGHT",
    "SLOPE_LINE_SELECTED",
    "HORIZONTAL_LINE_DRAWING",
    "HORIZONTAL_LINE_EDITING_LEFT",
    "HORIZONTAL_LINE_EDITING_RIGHT",
    "HORIZONTAL_LINE_SELECTED",
    "VERTICAL_LINE_DRAWING",
    "VERTICAL_LINE_EDITING_TOP",
    "VERTICAL_LINE_EDITING_BOTTOM",
    "VERTICAL_LINE_SELECTED",],
  ["CURVE_EDITING_CONTROLֹ_POINT",
    "CURVE_EDITING_LEFT",
    "CURVE_EDITING_RIGHT",
    "SLOPE_LINE_EDITING_LEFT",
    "SLOPE_LINE_EDITING_RIGHT",
    "HORIZONTAL_LINE_EDITING_LEFT",
    "HORIZONTAL_LINE_EDITING_RIGHT",
    "VERTICAL_LINE_EDITING_TOP",
    "VERTICAL_LINE_EDITING_BOTTOM",
    ],
    () => {
      setTimeout(() => {
        lineDrawer.resetDrawing();
      }, 0);
});

</script>
