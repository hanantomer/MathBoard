<template>
  <div class="status-bar-host text-center">
    <v-snackbar
      v-model="snackbar"
      :timeout="timeout"
      location="bottom"
      class="status-bar-snackbar"
    >
      {{ text }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { GlobalEditMode, EditMode } from "common/unions";
import useWatchHelper from "../helpers/watchHelper";
import { getEditModeStatusText } from "../constants/helpCopy";

const watchHelper = useWatchHelper();
const snackbar = ref(false);
const text = ref("");
const timeout = ref(30000);

watchHelper.watchEveryEditModeChange(setStatusBarText);
watchHelper.watchGlobalEditModeChange(setStatusBarText);

watchHelper.watchCustomEvent(
  [
    "LINE_DRAWING",
    "LINE_EDITING_LEFT",
    "LINE_EDITING_RIGHT",
    "POLYGON_DRAWING",
  ],
  "EV_LINE_CHANGED",
  setStatusBarLineIndication,
);

function setStatusBarLineIndication(lineStatus: string) {
  text.value = lineStatus;

  snackbar.value = true;
}

function setStatusBarText(editMode: EditMode | GlobalEditMode) {
  const statusText = getEditModeStatusText(editMode);
  if (!statusText) {
    snackbar.value = false;
    return;
  }

  text.value = statusText;
  snackbar.value = true;
}
</script>

<style scoped>
.status-bar-host {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  pointer-events: none;
}

.status-bar-host :deep(.v-snackbar) {
  pointer-events: auto;
}

@media (max-width: 1023px) {
  .status-bar-host :deep(.v-snackbar__wrapper) {
    margin-bottom: max(8px, env(safe-area-inset-bottom));
    max-width: calc(100vw - 24px);
  }
}
</style>
