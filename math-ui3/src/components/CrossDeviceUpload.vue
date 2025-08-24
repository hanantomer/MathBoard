<template>
  <v-dialog
    v-model="dialog"
    max-width="500"
    persistent
    @keydown.esc="closeDialog"
    class="cross-device-upload-dialog"
  >
    <v-card class="pa-4">
      <v-card-title class="headline d-flex justify-space-between align-center">
        Take Photo from Phone
        <v-btn icon @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="text-center">

        <div class="mt-6">
          <p class="text-subtitle-1">Scan this QR code with your phone:</p>
          <qrcode :value="uploadImageUrl" :options="{ width: 200 }"></qrcode>
          <p>Waiting for photo upload...</p>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, onUnmounted } from "vue";
import Qrcode from "qrcode.vue";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useUserStore } from "../store/pinia/userStore";
import { FeathersHelper } from "../helpers/feathersHelper";

const notationMutateHelper = useNotationMutateHelper();
const lessonStore = useLessonStore();
const userStore = useUserStore();

// Define props and events
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const dialog = ref(false);
const uploadImageUrl = ref("");
const isSessionActive = ref(false);

// Watch for changes from the parent component to control the dialog
watch(
  () => props.show,
  (newValue) => {
    dialog.value = newValue;
    // Reset state when the dialog is opened
    if (newValue) {
      startLoadingImageSession();
      resetSession();
    }
  },
);

// Method to close the dialog and emit the event
function closeDialog() {
  emit("close");
  resetSession();
}

// Method to reset the component's state
const resetSession = () => {
  isSessionActive.value = false;
  //imageUrl.value = "";
};

// Method to generate a QR code
function generateQRCode(url: string) {
  uploadImageUrl.value = url;
}

// Method to start a new upload session
const startLoadingImageSession = async () => {
  isSessionActive.value = true;

  try {
    const uploadUrl = `${
      window.location.origin
    }/uploadPhoto/${lessonStore.getCurrentLesson()
      ?.uuid}/${userStore.getCurrentUser()?.uuid}`;

    generateQRCode(uploadUrl);

    console.log("Upload URL:", uploadUrl);

    const feathersClient = FeathersHelper.getInstance();

    feathersClient.service("imageLoaded").on("updated", (data: any) => {
      if (!isSessionActive.value) return;
      isSessionActive.value = false;
      notationMutateHelper.addImageNotation(data.base64);
      isSessionActive.value = false;
      closeDialog();
    });
  } catch (error) {
    console.error("Failed to start session:", error);
    isSessionActive.value = false;
    closeDialog();
  }
};

onUnmounted(() => {
  isSessionActive.value = false;
  uploadImageUrl.value = "";
});
</script>

<style scoped>
.cross-device-upload-dialog {
  max-width: 600px;
  width: 100%;
  height: 100%;
}
</style>
