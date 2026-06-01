<template>
  <div class="instruction-bar-host">
    <div
      v-if="persistentText"
      class="instruction-bar"
      data-cy="instruction-bar"
      role="status"
      aria-live="polite"
    >
      <v-icon v-if="isToolActive" size="small" class="instruction-bar__icon">
        mdi-gesture-tap
      </v-icon>
      <span class="instruction-bar__text">{{ persistentText }}</span>
    </div>

    <v-snackbar
      v-model="transientOpen"
      :timeout="3500"
      location="bottom"
      class="instruction-transient"
      color="grey-darken-3"
    >
      {{ transientText }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { GlobalEditMode, EditMode } from "common/unions";
import useWatchHelper from "../helpers/watchHelper";
import { useEditModeStore } from "../store/pinia/editModeStore";
import {
  EDITING_BASICS,
  getActiveToolDisplay,
  getEditModeStatusText,
} from "../constants/helpCopy";

const watchHelper = useWatchHelper();
const editModeStore = useEditModeStore();
const transientOpen = ref(false);
const transientText = ref("");

const currentMode = computed(() => editModeStore.getEditMode());

const isToolActive = computed(
  () => currentMode.value && currentMode.value !== "CELL_SELECTED",
);

const persistentText = computed(() => {
  const mode = currentMode.value;
  if (!mode || mode === "CELL_SELECTED") {
    return EDITING_BASICS.idle;
  }
  const active = getActiveToolDisplay(mode);
  if (active) {
    return active.hint ? `${active.label} — ${active.hint}` : active.label;
  }
  return getEditModeStatusText(mode) ?? "";
});

watchHelper.watchEveryEditModeChange(onEditModeChange);
watchHelper.watchGlobalEditModeChange(onEditModeChange);

watchHelper.watchCustomEvent(
  [
    "LINE_DRAWING",
    "LINE_EDITING_LEFT",
    "LINE_EDITING_RIGHT",
    "POLYGON_DRAWING",
  ],
  "EV_LINE_CHANGED",
  (lineStatus: string) => {
    transientText.value = lineStatus;
    transientOpen.value = true;
  },
);

function onEditModeChange(_editMode: EditMode | GlobalEditMode) {
  transientOpen.value = false;
}
</script>

<style scoped>
.instruction-bar-host {
  position: fixed;
  left: 80px;
  right: 0;
  bottom: 0;
  z-index: 2000;
  pointer-events: none;
  display: flex;
  justify-content: center;
  padding: 0 12px 8px;
}

.instruction-bar {
  pointer-events: auto;
  display: flex;
  align-items: center;
  max-width: min(92vw, 720px);
  width: 100%;
  padding: 8px 16px;
  border-radius: 8px 8px 0 0;
  background: rgba(32, 39, 80, 0.96);
  color: #e3f2fd;
  font-size: 0.875rem;
  line-height: 1.35;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.2);
  border-top: 2px solid rgba(66, 165, 245, 0.45);
}

.instruction-bar__icon {
  flex-shrink: 0;
  margin-right: 8px;
}

.instruction-bar__text {
  flex: 1;
  min-width: 0;
}

.instruction-bar-host :deep(.instruction-transient) {
  pointer-events: auto;
}

@media (max-width: 1023px) {
  .instruction-bar-host {
    left: 56px;
    padding-bottom: max(8px, env(safe-area-inset-bottom));
  }

  .instruction-bar {
    font-size: 0.8125rem;
    padding: 6px 12px;
  }
}
</style>
