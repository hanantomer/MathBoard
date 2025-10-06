<template>
  <v-menu
    v-model="show"
    class="floatingToolbar"
    :close-on-content-click="false"
    transition="scale-transition"
    :offset="5"
  >
    <v-card class="toolbar-card" elevation="4" rounded="lg" width="240">
      <v-card-title class="px-4 py-2 toolbar-title">
        <span class="text-subtitle-1 font-weight-medium">Edit Properties</span>

        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          @click="close"
        ></v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-4">
        <ColorSelector class="mb-4"></ColorSelector>
        <LinePropertiesSelector></LinePropertiesSelector>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ColorSelector from "./ColorSelector.vue";
import LinePropertiesSelector from "./LinePropertiesSelector.vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";

const notationStore = useNotationStore();
const editModeStore = useEditModeStore();


const show = computed(() => {
  return notationStore.getSelectedNotations().length === 1;
});


// watchHelper.watchCustomEvent(
//   ["LINE_SELECTED"],
//   "EV_NOTATION_SELECTED",
//   (notation: NotationAttributes) => {
//     const pos = screenHelper.getNotationTopLeft(notation);
//     topPosition.value = pos.y - 150;
//     leftPosition.value = pos.x + 20;
//   },
// );

function close() {
  editModeStore.setDefaultEditMode();
}
</script>

<style scoped>
.floatingToolbar button {
  float: right;
}

.floatingToolbar {
  position: absolute;
  z-index: 1000;
  top: 0;
  left: 30%;
}

.toolbar-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.1);
}

.toolbar-title {
  background: rgba(0, 0, 0, 0.03);
}

:deep(.v-card-text) {
  padding-top: 16px !important;
}

:deep(.v-menu__content) {
  border-radius: 12px;
  overflow: hidden;
}

/* Add smooth transitions */
.scale-transition-enter-active,
.scale-transition-leave-active {
  transition: all 0.2s ease-in-out;
}

.scale-transition-enter-from,
.scale-transition-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
