<template>
  <v-fade-transition>
    <v-card v-show="showToolbar" class="floating-toolbar" elevation="4">
      <v-btn-group>
        <ColorSelector></ColorSelector>
        <v-tooltip text="Select notations">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              color="white"
              x-small
              fab
              dark
              ><v-icon>mdi-selection</v-icon></v-btn
            >
          </template>
        </v-tooltip>
      </v-btn-group>
    </v-card>
  </v-fade-transition>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import ColorSelector from "./ColorSelector.vue";

const notationStore = useNotationStore();

const showToolbar = computed(
  () => notationStore.getSelectedNotations().length > 0,
);

// Position toolbar above the first selected notation
const toolbarPosition = computed(() => {
  if (!showToolbar.value) return {};

  let x = 400,
    y = 75;

  return {
    left: `${x}px`,
    top: `${y}px`,
  };
});
</script>

<style scoped>
.floating-toolbar {
  position: absolute;
  align-items: center;
  justify-content: center;
  gap: 8px;
  top: 65px;
  left: 60px;
  z-index: 100;
  background: transparent;
  color: white;
  height: 45px;
}
.v-btn {
  color: black;
}
</style>
