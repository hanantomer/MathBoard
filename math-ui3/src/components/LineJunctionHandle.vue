<template>
  <v-card
    class="lineJunctionHandle"
    data-cy="line-junction-handle"
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

const emit = defineEmits<{
  editStart: [];
}>();

const props = defineProps({
  editingMode: {
    required: true,
    type: String as PropType<EditMode>,
  },
});

function startEdit(e: PointerEvent) {
  e.preventDefault();
  emit("editStart");
  editModeStore.setEditMode(props.editingMode);
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

<style scoped>
.lineJunctionHandle {
  background-color: #1976d2;
  border: 2px solid white;
  cursor: move;
  touch-action: none;
  position: absolute;
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  z-index: 1000;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
}
</style>
