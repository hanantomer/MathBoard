<template>
  <div
    v-for="handle in TEXT_RESIZE_HANDLES"
    :key="handle"
    class="text-resize-handle"
    :class="'text-resize-handle--' + handle"
    :data-cy="'textResize-' + handle"
    @pointerdown.stop="emit('start', $event, handle)"
    @pointerup.stop="emit('end', $event)"
    @pointercancel.stop="emit('end', $event)"
  ></div>
</template>

<script setup lang="ts">
import {
  TEXT_RESIZE_HANDLES,
  type TextResizeHandle,
} from "../helpers/textResizeHelper";

const emit = defineEmits<{
  start: [event: PointerEvent, handle: TextResizeHandle];
  end: [event: PointerEvent];
}>();
</script>

<style scoped>
.text-resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  box-sizing: border-box;
  background: #fff;
  border: 2px solid #333;
  border-radius: 1px;
  z-index: 2;
  pointer-events: auto;
  touch-action: none;
  transform: translate(-50%, -50%);
}

.text-resize-handle--nw {
  top: 0;
  left: 0;
  cursor: nwse-resize;
}
.text-resize-handle--n {
  top: 0;
  left: 50%;
  cursor: ns-resize;
}
.text-resize-handle--ne {
  top: 0;
  left: 100%;
  cursor: nesw-resize;
}
.text-resize-handle--e {
  top: 50%;
  left: 100%;
  cursor: ew-resize;
}
.text-resize-handle--se {
  top: 100%;
  left: 100%;
  cursor: nwse-resize;
}
.text-resize-handle--s {
  top: 100%;
  left: 50%;
  cursor: ns-resize;
}
.text-resize-handle--sw {
  top: 100%;
  left: 0;
  cursor: nesw-resize;
}
.text-resize-handle--w {
  top: 50%;
  left: 0;
  cursor: ew-resize;
}
</style>
