<template>
  <v-card
    class="lineHandle"
    @pointerup="endEdit"
    @pointercancel="endEdit"
    @pointerdown="startEdit"
  ></v-card>
</template>
<script setup lang="ts">
import { PropType } from "vue";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { EditMode } from "common/unions";
import useEventBus from "../helpers/eventBusHelper";

const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const eventBus = useEventBus();

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

function startEdit(e: PointerEvent) {
  e.preventDefault();
  editModeStore.setEditMode(props.editingMode);
  // Route subsequent pointermove/up to the board SVG so editing works while
  // the contact stays over this small handle (and on browsers that retarget touches).
  const id = cellStore.getSvgId();
  const svg = id ? document.getElementById(id) : null;
  if (svg && e.pointerId != null) {
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {
      /* detached or capture not allowed */
    }
  }
}

function endEdit(e: PointerEvent) {
  eventBus.emit("EV_SVG_POINTERUP", e);
}
</script>
<style>
.lineHandle {
  background-color: lightgray;
  cursor: col-resize;
  touch-action: none;
  position: absolute;
  display: block;
  width: 8px;
  height: 8px;
  border: 2, 2, 2, 2;
  z-index: 999;
}
</style>
