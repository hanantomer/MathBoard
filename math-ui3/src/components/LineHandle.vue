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
import { EditMode } from "../../../math-common/src/unions";
import useEventBus from "../helpers/eventBusHelper";

const editModeStore = useEditModeStore();
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


function endEdit(e: MouseEvent) {
  eventBus.emit("EV_SVG_MOUSEUP", e);
}
</script>
<style>
.lineHandle {
  cursor: col-resize;
  position: absolute;
  display: block;
  width: 6px;
  height: 6px;
  border: 2, 2, 2, 2;
  z-index: 999;
}
</style>
