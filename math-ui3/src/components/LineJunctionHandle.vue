<template>
  <div
    class="lineJunctionHandle"
    data-cy="line-junction-handle"
    @pointerup="endEdit"
    @pointercancel="endEdit"
    @pointerdown="startEdit"
  ></div>
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
  cursor: grab;
  touch-action: none;
  position: fixed;
  display: block;
  width: 24px;
  height: 24px;
  box-sizing: border-box;
  z-index: 1000;
  background: transparent;
}

.lineJunctionHandle:active {
  cursor: grabbing;
}

.lineJunctionHandle::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border-radius: 50%;
  background: #1976d2;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
  transform: translate(-50%, -50%);
  pointer-events: none;
}
</style>
