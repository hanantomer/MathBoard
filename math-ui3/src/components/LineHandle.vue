<template>
  <v-card
    class="lineHandle"
    v-on:mouseup="endEdit"
    v-on:mousedown="() => editModeStore.setEditMode(props.editingMode)"
  ></v-card>
</template>
<script setup lang="ts">
import { PropType } from "vue";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { EditMode } from "../../../math-common/src/unions";
import useWatchHelper from "../helpers/watchHelper";
import useLineDrawer from "../helpers/lineDrawingHelper";

const notationStore = useNotationStore();
const lineDrawer = useLineDrawer();
const editModeStore = useEditModeStore();
const watchHelper = useWatchHelper();

const props = defineProps({
  drawingMode: {
    required: true,
    type: String as PropType<EditMode>,
  },
  editingMode: {
    required: true,
    type: String as PropType<EditMode>,
  },
});

watchHelper.watchMouseEvent(
  [props.editingMode, props.drawingMode],
  "EV_SVG_MOUSEUP",
  endEdit,
);

function endEdit() {
  if (notationStore.hasSelectedNotations()) {
    lineDrawer.showMatrixLine();
  }
  editModeStore.setDefaultEditMode();
}
</script>
<style>
.lineHandle {
  cursor: col-resize;
  position: absolute;
  display: block;
  width: 9px;
  height: 9px;
  border: 2, 2, 2, 2;
  z-index: 999;
}
</style>
