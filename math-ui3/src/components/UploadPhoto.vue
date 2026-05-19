<template>
  <v-container class="upload-photo-page fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card class="pa-2 pa-sm-4" elevation="4" rounded="lg">
          <v-card-title class="text-h5 text-center text-wrap">
            Send photo to MathBoard
          </v-card-title>
          <v-card-subtitle class="text-center text-wrap pb-2">
            This page links your phone to the lesson open on your computer.
          </v-card-subtitle>

          <v-card-text>
            <v-alert
              v-if="pageError"
              type="error"
              variant="tonal"
              class="mb-4"
              :text="pageError"
            />

            <v-chip
              class="mb-4 w-100 justify-center"
              :color="connectionChip.color"
              :prepend-icon="connectionChip.icon"
              label
            >
              {{ connectionChip.text }}
            </v-chip>

            <input
              ref="cameraInputRef"
              type="file"
              accept="image/*"
              capture="environment"
              class="d-none"
              @change="onNativeFileChange"
            />
            <input
              ref="galleryInputRef"
              type="file"
              accept="image/*"
              class="d-none"
              @change="onNativeFileChange"
            />

            <div class="d-flex flex-column flex-sm-row ga-2">
              <v-btn
                color="primary"
                variant="tonal"
                block
                prepend-icon="mdi-camera"
                :disabled="!canPickPhoto"
                @click="openCamera"
              >
                Take photo
              </v-btn>
              <v-btn
                color="primary"
                variant="outlined"
                block
                prepend-icon="mdi-image-multiple"
                :disabled="!canPickPhoto"
                @click="openGallery"
              >
                Choose from gallery
              </v-btn>
            </div>

            <p
              v-if="selectedFileName"
              class="text-body-2 text-medium-emphasis mt-3 mb-0"
            >
              Selected: {{ selectedFileName }}
            </p>

            <v-img
              v-if="previewUrl"
              :src="previewUrl"
              max-height="220"
              class="mt-3 rounded"
              cover
            />

            <v-btn
              v-if="selectedFile"
              variant="text"
              size="small"
              class="mt-1"
              :disabled="isUploading"
              @click="clearSelectedFile"
            >
              Clear photo
            </v-btn>

            <v-progress-linear
              v-if="isUploading"
              indeterminate
              color="primary"
              class="mt-4"
            />
          </v-card-text>

          <v-card-actions class="flex-column ga-2 px-4 pb-4">
            <v-btn
              color="primary"
              size="large"
              block
              :disabled="!canUploadWithHint"
              :loading="isUploading"
              @click="uploadPhoto"
            >
              Send to board
            </v-btn>
            <p
              v-if="selectedFile && connectionState !== 'ready'"
              class="text-caption text-center text-medium-emphasis mt-2 mb-0"
            >
              Waiting for server connection…
            </p>
          </v-card-actions>
        </v-card>

        <v-card
          v-if="uploadPhase === 'success'"
          class="mt-4 pa-4 text-center"
          color="success"
          variant="tonal"
        >
          <v-icon size="48" class="mb-2">mdi-check-circle</v-icon>
          <div class="text-h6">Photo sent</div>
          <p class="text-body-2 mt-2 mb-0">
            Return to your computer — the image should appear on the board.
          </p>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Application } from "@feathersjs/feathers";
import { FeathersHelper } from "../helpers/feathersHelper";
import useImageHelper from "../helpers/imageHelper";
import {
  isValidUploadSessionId,
  logCrossDeviceUpload,
  withTimeout,
} from "../helpers/crossDeviceUploadLog";

const UPLOAD_TIMEOUT_MS = 90_000;

const imageHelper = useImageHelper();

const props = defineProps({
  userUUId: { type: String, required: true },
  lessonUUId: { type: String, required: true },
});

type UploadPhase = "idle" | "connecting" | "ready" | "uploading" | "success" | "error";
type ConnectionState = "connecting" | "ready" | "error";

let feathersClient: Application | null = null;
let previewObjectUrl: string | null = null;

const cameraInputRef = ref<HTMLInputElement | null>(null);
const galleryInputRef = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const selectedFileName = ref("");
const uploadPhase = ref<UploadPhase>("idle");
const connectionState = ref<ConnectionState>("connecting");
const pageError = ref("");
const isUploading = ref(false);

const snackbar = ref({
  show: false,
  text: "",
  color: "success",
});

const connectionChip = computed(() => {
  switch (connectionState.value) {
    case "ready":
      return {
        color: "success",
        icon: "mdi-wifi",
        text: "Connected — ready to send",
      };
    case "error":
      return {
        color: "error",
        icon: "mdi-wifi-off",
        text: "Not connected to server",
      };
    default:
      return {
        color: "warning",
        icon: "mdi-wifi-strength-1",
        text: "Connecting to server…",
      };
  }
});

const previewUrl = ref<string | null>(null);

const canPickPhoto = computed(
  () => uploadPhase.value !== "success" && !isUploading.value,
);

const canUploadWithHint = computed(
  () => !!selectedFile.value && !isUploading.value && uploadPhase.value !== "success",
);

function showSnackbar(text: string, color: string) {
  snackbar.value = { show: true, text, color };
}

function revokePreview() {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
  }
  previewUrl.value = null;
}

function fileFromInput(event: Event): File | null {
  const input = event.target as HTMLInputElement;
  return input.files?.[0] ?? null;
}

function setSelectedFile(file: File | null) {
  revokePreview();
  selectedFile.value = file;
  selectedFileName.value = file?.name ?? "";
  if (file) {
    previewObjectUrl = URL.createObjectURL(file);
    previewUrl.value = previewObjectUrl;
  }
}

function onNativeFileChange(event: Event) {
  const file = fileFromInput(event);
  if (file) {
    setSelectedFile(file);
  }
  const input = event.target as HTMLInputElement;
  input.value = "";
}

function openCamera() {
  cameraInputRef.value?.click();
}

function openGallery() {
  galleryInputRef.value?.click();
}

function clearSelectedFile() {
  setSelectedFile(null);
  cameraInputRef.value && (cameraInputRef.value.value = "");
  galleryInputRef.value && (galleryInputRef.value.value = "");
}

function validateSession(): boolean {
  if (
    !isValidUploadSessionId(props.lessonUUId) ||
    !isValidUploadSessionId(props.userUUId)
  ) {
    pageError.value = "This upload link is invalid. Scan the QR code again.";
    void logCrossDeviceUpload("mobile", "invalid_session_ids", {
      lessonUUId: props.lessonUUId,
      userUUId: props.userUUId,
    });
    return false;
  }
  return true;
}

async function connectToMessaging(): Promise<boolean> {
  uploadPhase.value = "connecting";
  connectionState.value = "connecting";
  pageError.value = "";

  try {
    feathersClient = FeathersHelper.getInstance(
      props.userUUId,
      props.lessonUUId,
    );
    await FeathersHelper.waitUntilConnected();
    await FeathersHelper.ensureLessonChannel(props.lessonUUId);
    connectionState.value = "ready";
    uploadPhase.value = "ready";
    return true;
  } catch (error) {
    connectionState.value = "error";
    uploadPhase.value = "error";
    pageError.value =
      "Could not connect to the server. Check your network and try again.";
    void logCrossDeviceUpload(
      "mobile",
      "messaging_connect_failed",
      error instanceof Error ? error.message : String(error),
    );
    return false;
  }
}

async function uploadPhoto() {
  const file = selectedFile.value;
  if (!file) {
    showSnackbar("Choose a photo first", "warning");
    return;
  }
  if (connectionState.value !== "ready") {
    showSnackbar("Still connecting — wait a moment", "warning");
    if (connectionState.value === "error") {
      await connectToMessaging();
    }
  }
  if (connectionState.value !== "ready") {
    void logCrossDeviceUpload("mobile", "upload_while_not_connected");
    return;
  }
  if (!feathersClient) {
    feathersClient = FeathersHelper.getInstance(
      props.userUUId,
      props.lessonUUId,
    );
  }

  isUploading.value = true;
  uploadPhase.value = "uploading";

  try {
    const base64 = await withTimeout(
      imageHelper.prepareImageFileForUpload(file),
      UPLOAD_TIMEOUT_MS,
      "Preparing the photo took too long",
    );
    await withTimeout(
      feathersClient.service("imageLoaded").update(null, {
        lessonUUId: props.lessonUUId,
        base64,
      }),
      UPLOAD_TIMEOUT_MS,
      "Sending to the board timed out — check your connection",
    );

    uploadPhase.value = "success";
    clearSelectedFile();
    showSnackbar("Photo sent to your board", "success");
  } catch (error) {
    uploadPhase.value = "error";
    const message =
      error instanceof Error ? error.message : "Upload failed";
    showSnackbar(`Upload failed: ${message}`, "error");
    void logCrossDeviceUpload("mobile", "upload_failed", message);
  } finally {
    isUploading.value = false;
  }
}

onMounted(async () => {
  if (!validateSession()) {
    uploadPhase.value = "error";
    connectionState.value = "error";
    return;
  }
  await connectToMessaging();
});

onUnmounted(() => {
  revokePreview();
  if (uploadPhase.value !== "uploading") {
    FeathersHelper.disconnect();
  }
  feathersClient = null;
});
</script>

<style scoped>
.upload-photo-page {
  min-height: 100dvh;
  background: linear-gradient(
    180deg,
    rgb(var(--v-theme-surface)) 0%,
    rgb(var(--v-theme-surface-variant), 0.35) 100%
  );
}
</style>
