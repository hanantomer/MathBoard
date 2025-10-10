<template>
  <v-menu
    v-model="show"
    class="floatingToolbar"
    :close-on-content-click="false"
    transition="scale-transition"
    :offset="3"
  >
    <v-card class="toolbar-card" elevation="4" rounded="lg" width="120">
      <!-- Reduced width -->
      <v-card-title class="px-2 py-1 toolbar-title">
        <!-- Reduced padding -->
        <span class="text-caption font-weight-medium">Properties</span>
        <!-- Smaller text -->
        <v-btn
          icon="mdi-close"
          size="x-small"
          variant="text"
          @click="close"
        ></v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-2">
        <div class="d-flex align-center mb-2">
          <ColorSelector></ColorSelector>
          <LinePropertiesSelector></LinePropertiesSelector>
          <RotationSelector></RotationSelector>
        </div>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ColorSelector from "./ColorSelector.vue";
import LinePropertiesSelector from "./LinePropertiesSelector.vue";
import RotationSelector from "./RotationSelector.vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";

const notationStore = useNotationStore();
const editModeStore = useEditModeStore();

const show = computed(() => {
  return (
    notationStore.getSelectedNotations().length === 1 &&
    (notationStore.getSelectedNotations()[0].notationType == "ANNOTATION" ||
      notationStore.getSelectedNotations()[0].notationType == "LINE" ||
      notationStore.getSelectedNotations()[0].notationType == "SYMBOL" ||
      notationStore.getSelectedNotations()[0].notationType == "CIRCLE" ||
      notationStore.getSelectedNotations()[0].notationType == "SIGN")
  );
});

function close() {
  editModeStore.setDefaultEditMode();
  notationStore.resetSelectedNotations();
}
</script>

<style scoped>
.floatingToolbar {
  position: absolute;
  z-index: 1000;
  top: 0 !important;
  left: 30%;
  margin-top: -110px; /* Adjust vertical position */
  transform: scale(0.8); /* Add overall scaling */
}

.toolbar-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1); /* Reduced shadow */
}

.toolbar-title {
  background: rgba(0, 0, 0, 0.03);
  min-height: 32px !important; /* Reduced height */
}

.toolbar-buttons {
  min-height: 24px !important; /* Reduced height */
  max-height: 58px !important; /* Reduced height */
}

.toolbar-buttons .btn {
  max-width: 18px !important; /* Reduced button size */
  max-height: 18px !important; /* Reduced button size */
}

:deep(.v-card-text) {
  padding-top: 4px !important; /* Reduced padding */
}

:deep(.v-menu__content) {
  border-radius: 8px; /* Reduced border radius */
  overflow: hidden;
}

/* Existing transition styles... */
</style>
