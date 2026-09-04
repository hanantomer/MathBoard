<template>
  <div
    class="lineHandle"
    @pointerup="endEdit"
    @pointercancel="endEdit"
    @pointerdown="startEdit"
  ></div>
</template>
<script lang="ts">
/** Invisible hit box. Visual knob is smaller (see ::after). */
export const LINE_HANDLE_HIT_SIZE = 24;
export const LINE_HANDLE_HALF = LINE_HANDLE_HIT_SIZE / 2;
</script>
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
  const current = editModeStore.getEditMode();
  const selectedMode = props.editingMode.replace(/_EDITING.*$/, "_SELECTED");
  if (
    current !== props.drawingMode &&
    current !== props.editingMode &&
    current !== selectedMode
  ) {
    return;
  }
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
  cursor: grab;
  touch-action: none;
  position: fixed;
  display: block;
  width: 24px;
  height: 24px;
  box-sizing: border-box;
  z-index: 999;
  background: transparent;
}

.lineHandle:active {
  cursor: grabbing;
}

.lineHandle::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border-radius: 50%;
  background: #f5f5f5;
  border: 2px solid #333;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
</style>
