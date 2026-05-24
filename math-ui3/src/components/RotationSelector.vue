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
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useAuthorizationHelper from "../helpers/authorizationHelper";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { AnnotationNotationAttributes } from "common/baseTypes";

const notationStore = useNotationStore();
const notationMutateHelper = useNotationMutateHelper();
const authorizationHelper = useAuthorizationHelper();
const editModeStore = useEditModeStore();

const show = computed(() => {
  if (editModeStore.isImageCroppingMode()) return false;
  const selectedNotations = notationStore.getSelectedNotations();
  if (selectedNotations.length !== 1) return false;
  const type = selectedNotations[0].notationType;
  return type === "ANNOTATION" || type === "IMAGE";
});

function rotateSelection(degrees: number) {
  if (!authorizationHelper.canEdit()) return;

  if (notationStore.getSelectedNotations().length != 1) return;

  const selectedNotation = notationStore.getSelectedNotations()[0];

  if (selectedNotation.notationType === "IMAGE") {
    notationMutateHelper.rotateImageNotation(degrees);
    return;
  }

  const annotation =
    selectedNotation as AnnotationNotationAttributes;
  const currentRotation = annotation.rotation || 0;
  annotation.rotation = (currentRotation + degrees + 360) % 360;
  notationMutateHelper.updateNotation(annotation);
}

</script>

