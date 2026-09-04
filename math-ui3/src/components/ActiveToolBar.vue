<template>
  <div v-if="activeTool" class="active-tool-bar" role="status" aria-live="polite">
    <v-icon size="small" class="mr-2">mdi-gesture-tap</v-icon>
    <span class="active-tool-bar__label">{{ activeTool.label }}</span>
    <span v-if="activeTool.hint" class="active-tool-bar__hint">
      — {{ activeTool.hint }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { getActiveToolDisplay } from "../constants/helpCopy";

const editModeStore = useEditModeStore();

const activeTool = computed(() => {
  const mode = editModeStore.getEditMode();
  if (!mode || mode === "CELL_SELECTED") {
    return null;
  }
  return getActiveToolDisplay(mode);
});
</script>

<style scoped>
.active-tool-bar {
  position: fixed;
  bottom: 48px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1001;
  display: flex;
  align-items: center;
  max-width: min(92vw, 640px);
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(32, 39, 80, 0.94);
  color: #e3f2fd;
  font-size: 0.875rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(66, 165, 245, 0.35);
}

.active-tool-bar__label {
  font-weight: 600;
}

.active-tool-bar__hint {
  opacity: 0.85;
  margin-left: 4px;
}
</style>
