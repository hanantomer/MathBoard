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
} from "common/baseTypes";

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

watchHelper.watchPointerEvent(
  props.startEntry.editMode,
  ["EV_SVG_POINTERDOWN"],
  (e: PointerEvent) => {
    shapeDrawingHelper.setLineInitialPosition(e, props.startEntry.func);
  },
);

watchHelper.watchPointerEvent(
  props.drawEntry.editMode,
  ["EV_SVG_POINTERMOVE"],
  (e: PointerEvent) => shapeDrawingHelper.drawNewLine(e, props.drawEntry.func),
);

watchHelper.watchPointerEvent(
  props.editEntryFirstHandle.editMode,
  ["EV_SVG_POINTERMOVE"],
  (e: PointerEvent) =>
    shapeDrawingHelper.modifyLine(e, props.editEntryFirstHandle.func),
);

watchHelper.watchPointerEvent(
  props.editEntrySecondHandle.editMode,
  ["EV_SVG_POINTERMOVE"],
  (e: PointerEvent) =>
    shapeDrawingHelper.modifyLine(e, props.editEntrySecondHandle.func),
);

watchHelper.watchPointerEvent(
  props.saveEntry.editMode,
  ["EV_SVG_POINTERUP"],
  () => shapeDrawingHelper.saveDrawing(props.saveEntry.func),
);

watchHelper.watchPointerEvent(
  props.endEntry.editMode,
  ["EV_SVG_POINTERUP"],
  () => shapeDrawingHelper.resetDrawing(),
);

watchHelper.watchEndOfEditMode(
  ["LINE_SELECTED"],
  ["LINE_EDITING_LEFT", "LINE_EDITING_RIGHT"],
  () => shapeDrawingHelper.showMatrixLine(),
);

watchHelper.watchEndOfEditMode(
  ["DIVISIONLINE_SELECTED"],
  ["DIVISIONLINE_EDITING_LEFT", "DIVISIONLINE_EDITING_RIGHT"],
  () => shapeDrawingHelper.showMatrixLine(),
);

watchHelper.watchEndOfEditMode(["CIRCLE_SELECTED"], ["CIRCLE_EDITING"], () =>
  shapeDrawingHelper.showMatrixLine(),
);

watchHelper.watchEndOfEditMode(
  ["CONIC_SELECTED"],
  ["CONIC_EDITING_VERTEX", "CONIC_EDITING_SCALE", "CONIC_EDITING_OPENING"],
  () => shapeDrawingHelper.showMatrixLine(),
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
