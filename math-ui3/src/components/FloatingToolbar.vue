<template>
  <v-menu
    v-model="show"
    class="floatingToolbar"
    :close-on-content-click="false"
    transition="scale-transition"
    :offset="3"
  >
    <v-card class="toolbar-card" elevation="4" rounded="lg" width="auto">
      <v-card-text class="pa-2">
        <div class="d-flex align-center mb-2">
          <ColorSelector></ColorSelector>
          <LinePropertiesSelector></LinePropertiesSelector>
          <RotationSelector></RotationSelector>
          <DeleteTool></DeleteTool>
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
import DeleteTool from "./DeleteTool.vue";
import { useNotationStore } from "../store/pinia/notationStore";

const notationStore = useNotationStore();

const show = computed(() => {
  return notationStore.getSelectedNotations().length > 0;
});


</script>

<style scoped>
.floatingToolbar {
  position: absolute;
  z-index: 1000;
  left: 40%;
  margin-top: -90px; /* Adjust vertical position */
  transform: scale(0.8); /* Add overall scaling */
}

.toolbar-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1); /* Reduced shadow */
}

:deep(.v-menu__content) {
  border-radius: 8px; /* Reduced border radius */
  overflow: hidden;
}

/* Existing transition styles... */
</style>
