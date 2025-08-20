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
        <p v-if="!isSessionActive">
          Click the button below to start a new photo upload session.
        </p>

        <v-btn
          color="primary"
          @click="startLoadingImageSession"
          :disabled="isSessionActive"
          block
          class="my-4"
        >
          {{ isSessionActive ? "Session Active" : "Start Upload Session" }}
        </v-btn>

        <v-divider></v-divider>

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
import { ref, watch, defineProps } from "vue";
import Qrcode from "qrcode.vue";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useApiHelper from "../helpers/apiHelper";
import { useCellStore } from "../store/pinia/cellStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useUserStore } from "../store/pinia/userStore";
import { FeathersHelper } from "../helpers/feathersHelper";

const notationMutateHelper = useNotationMutateHelper();
const apiHelper = useApiHelper();
const cellStore = useCellStore();
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

// Reactive state
const dialog = ref(false);
//const imageUrl = ref("");
const uploadImageUrl = ref("");
const isSessionActive = ref(false);

// Watch for changes from the parent component to control the dialog
watch(
  () => props.show,
  (newValue) => {
    dialog.value = newValue;
    // Reset state when the dialog is opened
    if (newValue) {
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
      const uploadedImageUrl = apiHelper.getImageUrl(data.imageName);
      //imageUrl.value = uploadedImageUrl;
      isSessionActive.value = false;

      processImage(uploadedImageUrl).then((result) => {
        const sellectedCell = cellStore.getSelectedCell() ?? {
          col: 1,
          row: 1,
        };

        notationMutateHelper.addImageNotation(
          sellectedCell.col,
          sellectedCell.col +
            Math.round(
              result.dimensions.width / cellStore.getCellHorizontalWidth(),
            ),
          sellectedCell.row,
          sellectedCell.row +
            Math.round(
              result.dimensions.height / cellStore.getCellVerticalHeight(),
            ),
          result.base64,
        );
        isSessionActive.value = false;
      });
      closeDialog();
    });
  } catch (error) {
    console.error("Failed to start session:", error);
    isSessionActive.value = false;
    closeDialog();
  }
};

function processImage(
  url: string,
): Promise<{ base64: string; dimensions: { width: number; height: number } }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Handle CORS if needed

    img.onload = () => {
      // Convert to base64
      // Calculate new dimensions maintaining aspect ratio
      let newWidth = img.width;
      let newHeight = img.height;
      const maxDimension = 600;

      if (img.width > maxDimension || img.height > maxDimension) {
        if (img.width > img.height) {
          newWidth = maxDimension;
          newHeight = Math.floor((img.height * maxDimension) / img.width);
        } else {
          newHeight = maxDimension;
          newWidth = Math.floor((img.width * maxDimension) / img.height);
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      const base64String = canvas.toDataURL("image/png");

      resolve({
        base64: base64String,
        dimensions: {
          width: newWidth,
          height: newHeight,
        },
      });
    };

    img.onerror = () => {
      reject(new Error("Failed to load image:"));
    };

    img.src = url;
  });
}

// Disconnect the socket when the component is unmounted
</script>

<style scoped>
.cross-device-upload-dialog {
  max-width: 600px;
  width: 100%;
  height: 100%;
}
</style>
