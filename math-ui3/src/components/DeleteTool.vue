<template>
  <v-tooltip text="Delete" location="bottom">
    <template v-slot:activator="{ props }">
      <v-btn
        v-show="show"
        v-bind="props"
        icon
        color="white"
        x-large
        fab
        dark
        @click="deleteSelectedNotations"
      >
        <v-icon>mdi-delete</v-icon></v-btn
      >
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import useNotationMutateHelper from "../helpers/notationMutateHelper";

const notationStore = useNotationStore();
const notationMutateHelper = useNotationMutateHelper();

const show = computed(() => {
  const selectedNotations = notationStore.getSelectedNotations();
  return selectedNotations.length > 0;
});

function deleteSelectedNotations() {
  notationMutateHelper.approveDeleteSelectedNotations();
}

</script>
