<template>
  <v-btn
    v-if="isMobileBoard"
    class="special-symbols-fab"
    data-cy="special-symbols-toolbar"
    icon
    color="primary"
    elevation="4"
    aria-label="Special symbols"
    @click="mobileSheetOpen = true"
  >
    <v-icon>mdi-sigma</v-icon>
  </v-btn>

  <v-bottom-sheet
    v-if="isMobileBoard"
    v-model="mobileSheetOpen"
    class="special-symbols-sheet"
  >
    <v-card class="special-symbols-sheet-card rounded-t-xl">
      <v-card-title class="d-flex justify-space-between align-center py-2">
        Special Symbols
        <v-btn
          icon
          variant="text"
          aria-label="Close"
          @click="mobileSheetOpen = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="special-symbols-sheet-body pa-2">
        <SpecialSymbolPanels
          close-on-select
          @close="mobileSheetOpen = false"
        />
      </v-card-text>
    </v-card>
  </v-bottom-sheet>

  <SpecialSymbolPanels
    v-if="!isMobileBoard"
    class="special-symbols-expansion"
    data-cy="special-symbols-toolbar"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { MOBILE_BOARD_MEDIA_QUERY } from "../composables/useBoardLayout";
import SpecialSymbolPanels from "./SpecialSymbolPanels.vue";

const isMobileBoard = useMediaQuery(MOBILE_BOARD_MEDIA_QUERY);
const mobileSheetOpen = ref(false);
</script>

<style scoped>
.special-symbols-fab {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 2040;
  min-width: 48px;
  min-height: 48px;
}

@media (max-width: 1023px) {
  .special-symbols-fab {
    right: max(12px, env(safe-area-inset-right));
    bottom: max(16px, env(safe-area-inset-bottom));
  }
}

.special-symbols-sheet {
  z-index: 2050;
}

.special-symbols-sheet-card {
  background-color: #453737;
}

.special-symbols-sheet-body {
  max-height: min(70vh, 520px);
  overflow-y: auto;
}

.special-symbols-expansion {
  top: 64px;
  right: 0;
  max-width: 210px;
  background-color: #453737;
  max-height: calc(100vh - 64px - 56px);
  position: fixed;
  overflow-y: auto;
}
</style>
