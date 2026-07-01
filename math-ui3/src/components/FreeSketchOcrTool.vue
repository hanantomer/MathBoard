<template>
  <v-tooltip text="Recognize as symbol" location="bottom">
    <template v-slot:activator="{ props }">
      <v-btn
        data-cy="freeSketchOcrToolButton"
        v-show="show"
        v-bind="props"
        icon
        color="white"
        x-large
        fab
        dark
        :loading="recognizing"
        :disabled="recognizing"
        @click="recognizeSelectedSketches"
      >
        <v-icon>mdi-draw</v-icon>
      </v-btn>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useAuthorizationHelper from "../helpers/authorizationHelper";

const notationStore = useNotationStore();
const notationMutateHelper = useNotationMutateHelper();
const authorizationHelper = useAuthorizationHelper();

const recognizing = ref(false);

const show = computed(() => {
  const selectedNotations = notationStore.getSelectedNotations();
  return (
    selectedNotations.length > 0 &&
    selectedNotations.every((n) => n.notationType === "FREESKETCH") &&
    authorizationHelper.canEdit()
  );
});

async function recognizeSelectedSketches() {
  if (recognizing.value) return;

  recognizing.value = true;
  try {
    await notationMutateHelper.recognizeAndReplaceSelectedFreeSketches();
  } finally {
    recognizing.value = false;
  }
}
</script>
