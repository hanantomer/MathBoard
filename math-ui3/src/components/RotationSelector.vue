<template>
  <v-tooltip text="Rotate" location="bottom">
    <template v-slot:activator="{ props }">
      <!-- <v-btn-group v-show="show" variant="outlined" density="compact"> -->
      <!-- <v-btn
          v-bind="props"
          icon="mdi-rotate-left"
          size="x-small"
          @click="rotateSelection(-5)"
        >
        </v-btn> -->
      <v-btn
        v-show="show"
        v-bind="props"
        icon
        color="white"
        x-large
        fab
        dark
        @click="rotateSelection(5)"
      >
        <v-icon>mdi-rotate-right</v-icon></v-btn
      >

      <!-- </v-btn-group> -->
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useAuthorizationHelper from "../helpers/authorizationHelper";
import { AnnotationNotationAttributes } from "common/baseTypes";

const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const notationMutateHelper = useNotationMutateHelper();
const authorizationHelper = useAuthorizationHelper();

const show = computed(() => {
  const selectedNotations = notationStore.getSelectedNotations();
  return (
    selectedNotations.length == 1 &&
    selectedNotations[0].notationType === "ANNOTATION"
  );
});

function rotateSelection(degrees: number) {
  if (!authorizationHelper.canEdit()) return;

  if (notationStore.getSelectedNotations().length != 1) return;

  const selectedNotation =
    notationStore.getSelectedNotations()[0] as AnnotationNotationAttributes;

  const currentRotation = selectedNotation.rotation || 0;
  selectedNotation.rotation = (currentRotation + degrees + 360) % 360;
  notationMutateHelper.updateNotation(selectedNotation);

//  editModeStore.setDefaultEditMode();
}
</script>

<style scoped>


</style>
