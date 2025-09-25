<template></template>

<script setup lang="ts">
import useWatchHelper from "../helpers/watchHelper";
import useShapeDrawingHelper from "../helpers/shapeDrawingHelper";
import { PropType } from "vue";

import {
  lineWatcherEntry,
  lineSaveWatcherEntry,
  lineSelectWatcherEntry,
  lineEndSelectionWatcherEntry,
  lineMoveWatcherEntry,
} from "../../../math-common/src/baseTypes";

const shapeDrawingHelper = useShapeDrawingHelper();
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

  saveEntry: {
    type: Object as PropType<lineSaveWatcherEntry>,
    required: true,
  },

  selectEntry: {
    type: Object as PropType<lineSelectWatcherEntry>,
    required: true,
  },

  endEntry: {
    type: Object as PropType<lineEndSelectionWatcherEntry>,
    required: true,
  },

  moveByKeyEntry: {
    type: Object as PropType<lineMoveWatcherEntry>,
    required: true,
  },
});

watchHelper.watchMouseEvent(
  props.startEntry.editMode,
  "EV_SVG_MOUSEDOWN",
  (e: MouseEvent) => {
    shapeDrawingHelper.setLineInitialPosition(e, props.startEntry.func);
  },
);

watchHelper.watchMouseEvent(
  props.drawEntry.editMode,
  "EV_SVG_MOUSE_OR_TOUCH_DRAG",
  (e: MouseEvent) => shapeDrawingHelper.drawNewLine(e, props.drawEntry.func),
);

watchHelper.watchMouseEvent(
  props.editEntryFirstHandle.editMode,
  "EV_SVG_MOUSE_OR_TOUCH_DRAG",
  (e: MouseEvent) =>
    shapeDrawingHelper.modifyLine(e, props.editEntryFirstHandle.func),
);

watchHelper.watchMouseEvent(
  props.editEntrySecondHandle.editMode,
  "EV_SVG_MOUSE_OR_TOUCH_DRAG",
  (e: MouseEvent) =>
    shapeDrawingHelper.modifyLine(e, props.editEntrySecondHandle.func),
);

watchHelper.watchMouseEvent(
  props.saveEntry.editMode,
  "EV_SVG_MOUSEUP",
  (e: MouseEvent) => shapeDrawingHelper.saveDrawing(e, props.saveEntry.func),
);

watchHelper.watchMouseEvent(
  props.endEntry.editMode,
  "EV_SVG_MOUSEUP",
  (e: MouseEvent) => shapeDrawingHelper.resetDrawing(e),
);

watchHelper.watchEndOfEditMode(
  ["LINE_SELECTED"],
  ["LINE_EDITING_LEFT", "LINE_EDITING_RIGHT"],
  () => shapeDrawingHelper.resetDrawing(null),
);

watchHelper.watchEndOfEditMode(
  ["DIVISION_LINE_SELECTED"],
  ["DIVISION_LINE_EDITING_LEFT", "DIVISION_LINE_EDITING_RIGHT"],
  () => shapeDrawingHelper.resetDrawing(null),
);

watchHelper.watchEndOfEditMode(["CIRCLE_SELECTED"], ["CIRCLE_EDITING"], () =>
  shapeDrawingHelper.resetDrawing(null),
);

watchHelper.watchNotationSelection(
  props.selectEntry.editMode,
  props.selectEntry.event,
  (n) => shapeDrawingHelper.selectLine(n, props.selectEntry.func),
);

watchHelper.watchKeyEvent(
  props.selectEntry.editMode,
  "EV_KEYUP",
  (e: KeyboardEvent) =>
    shapeDrawingHelper.moveLine(e, props.moveByKeyEntry.func),
);
</script>
