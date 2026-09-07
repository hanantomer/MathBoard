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
      <span
        v-if="parabolaPlacing"
        class="instruction-bar__actions"
      >
        <button
          v-if="canUndoParabola"
          type="button"
          class="instruction-bar__btn"
          data-cy="parabolaUndoPoint"
          @pointerdown.stop
          @click.stop="onUndoParabolaPoint"
        >
          Undo last point
        </button>
        <button
          type="button"
          class="instruction-bar__btn instruction-bar__btn--ghost"
          data-cy="parabolaCancelPlace"
          @pointerdown.stop
          @click.stop="onCancelParabola"
        >
          Cancel
        </button>
      </span>
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
import { useParabolaPlacement } from "../composables/useParabolaPlacement";

const watchHelper = useWatchHelper();
const editModeStore = useEditModeStore();
const parabolaPlace = useParabolaPlacement();
const transientOpen = ref(false);
const transientText = ref("");

const currentMode = computed(() => editModeStore.getEditMode());

const parabolaPlacing = computed(() => parabolaPlace.placingActive.value);

const canUndoParabola = computed(
  () => parabolaPlacing.value && parabolaPlace.count.value > 0,
);

const isToolActive = computed(
  () => currentMode.value && currentMode.value !== "CELL_SELECTED",
);

const persistentText = computed(() => {
  if (parabolaPlacing.value) {
    return `${parabolaPlace.stepLabel.value} — ${parabolaPlace.hint.value}`;
  }
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

function onUndoParabolaPoint() {
  parabolaPlace.undoLast();
}

function onCancelParabola() {
  parabolaPlace.setActive(false);
  editModeStore.setDefaultEditMode();
}

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

.instruction-bar__actions {
  display: flex;
  flex-shrink: 0;
  gap: 6px;
  margin-left: 12px;
}

.instruction-bar__btn {
  pointer-events: auto;
  border: 1px solid rgba(227, 242, 253, 0.55);
  background: #1565c0;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.2;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.instruction-bar__btn--ghost {
  background: transparent;
  color: #e3f2fd;
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
