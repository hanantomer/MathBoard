<template>
  <v-tooltip text="Crop" location="bottom">
    <template v-slot:activator="{ props }">
      <v-btn
        v-show="show"
        v-bind="props"
        icon
        color="white"
        x-large
        fab
        dark
        @click="startCrop"
      >
        <v-icon>mdi-crop</v-icon>
      </v-btn>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import useAuthorizationHelper from "../helpers/authorizationHelper";

const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const authorizationHelper = useAuthorizationHelper();

const show = computed(() => {
  if (editModeStore.isImageCroppingMode()) return false;
  const selectedNotations = notationStore.getSelectedNotations();
  return (
    selectedNotations.length === 1 &&
    selectedNotations[0].notationType === "IMAGE" &&
    authorizationHelper.canEdit()
  );
});

function startCrop() {
  if (!authorizationHelper.canEdit()) return;
  editModeStore.setEditMode("IMAGE_CROPPING");
}
</script>
