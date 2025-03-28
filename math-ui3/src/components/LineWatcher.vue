<template></template>

<script setup lang="ts">
import useWatchHelper from "../helpers/watchHelper";
import useLineDrawer from "../helpers/lineDrawingHelper";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { PropType } from "vue";

import {
  lineWatcherEntry,
  lineSaveWatcherEntry,
  lineSelectWatcherEntry,
  lineEndSelectionWatcherEntry,
} from "../../../math-common/src/baseTypes";

const lineDrawer = useLineDrawer();
const watchHelper = useWatchHelper();
const editModeStore = useEditModeStore();

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

  endSelectionEntry: {
    type: Object as PropType<lineEndSelectionWatcherEntry>,
    required: true,
  },
});

watchHelper.watchMouseEvent(
  [props.startEntry.editMode],
  "EV_SVG_MOUSEDOWN",
  (e: MouseEvent) => {
    lineDrawer.setLineInitialPosition(e, props.startEntry.func);
  },
);

watchHelper.watchMouseEvent(
  [props.drawEntry.editMode],
  "EV_SVG_MOUSEMOVE",
  (e: MouseEvent) => lineDrawer.drawNewLine(e, props.drawEntry.func),
);

watchHelper.watchMouseEvent(
  [props.editEntryFirstHandle.editMode],
  "EV_SVG_MOUSEMOVE",
  (e: MouseEvent) => lineDrawer.modifyLine(e, props.editEntryFirstHandle.func),
);

watchHelper.watchMouseEvent(
  [props.editEntrySecondHandle.editMode],
  "EV_SVG_MOUSEMOVE",
  (e: MouseEvent) => lineDrawer.modifyLine(e, props.editEntrySecondHandle.func),
);

watchHelper.watchMouseEvent(props.endEntry.editMode, "EV_SVG_MOUSEUP", () =>
  lineDrawer.endDrawing(props.endEntry.func),
);

watchHelper.watchNotationSelection(
  [props.selectEntry.editMode],
  props.selectEntry.event,
  (n) => lineDrawer.selectLine(n, props.selectEntry.func),
);


watchHelper.watchMouseEvent(
  props.endSelectionEntry.editMode,
  "EV_MOUSEUP",
  () => {
    setTimeout(() => {
      if (editModeStore.getEditMode() !== props.endSelectionEntry.editMode[0]/*only one event is being listned to*/)
        lineDrawer.resetDrawing();
    }, 0);
  },
);
</script>
