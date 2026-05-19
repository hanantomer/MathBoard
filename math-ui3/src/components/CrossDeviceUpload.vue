<template>
  <v-dialog
    v-model="dialog"
    max-width="520"
    persistent
    @keydown.esc="closeDialog"
    class="cross-device-upload-dialog"
  >
    <v-card class="pa-4">
      <v-card-title class="headline d-flex justify-space-between align-center">
        <span>Photo from phone</span>
        <v-btn icon variant="text" aria-label="Close" @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-alert
          v-if="sessionError"
          type="error"
          variant="tonal"
          class="mb-4"
          :text="sessionError"
        />

        <v-alert
          v-else-if="!hasSelectedCell"
          type="warning"
          variant="tonal"
          class="mb-4"
          title="Select a cell first"
          text="Click a cell on the board where the photo should be placed, then open this dialog again."
        />

        <v-chip
          class="mb-4"
          :color="statusChip.color"
          :prepend-icon="statusChip.icon"
          label
        >
          {{ statusChip.text }}
        </v-chip>

        <div v-if="canShowQr" class="text-center">
          <p class="text-body-2 mb-3">
            Scan the QR code with your phone, or copy the link below.
          </p>
          <qrcode :value="uploadImageUrl" :options="{ width: 220 }" />
          <v-text-field
            :model-value="uploadImageUrl"
            readonly
            density="compact"
            class="mt-4"
            hide-details
          >
            <template #append>
              <v-btn
                icon
                variant="text"
                size="small"
                aria-label="Copy link"
                @click="copyUploadLink"
              >
                <v-icon>mdi-content-copy</v-icon>
              </v-btn>
            </template>
          </v-text-field>
          <p
            v-if="isLocalhost"
            class="text-caption text-medium-emphasis mt-2 text-left"
          >
            Your computer is on localhost — the phone must use the same network
            and reach this app (not 127.0.0.1). Use your machine's LAN IP in the
            link if needed.
          </p>
          <v-progress-linear
            v-if="sessionStatus === 'waiting'"
            indeterminate
            color="primary"
            class="mt-4"
          />
          <v-progress-linear
            v-if="sessionStatus === 'processing'"
            indeterminate
            color="success"
            class="mt-4"
          />
          <p
            v-if="sessionStatus === 'processing'"
            class="text-body-2 mt-2 mb-0"
          >
            Photo received — placing on the board…
          </p>
        </div>

        <v-alert
          v-if="sessionStatus === 'received'"
          type="success"
          variant="tonal"
          class="mt-2"
          text="Photo received and added to the board."
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="copyUploadLink" :disabled="!uploadImageUrl">
          Copy link
        </v-btn>
        <v-btn color="primary" variant="flat" @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onUnmounted } from "vue";
import Qrcode from "qrcode.vue";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useUserStore } from "../store/pinia/userStore";
import { useCellStore } from "../store/pinia/cellStore";
import { FeathersHelper } from "../helpers/feathersHelper";
import {
  isValidUploadSessionId,
  logCrossDeviceUpload,
  extractImageLoadedPayload,
} from "../helpers/crossDeviceUploadLog";

const SESSION_TIMEOUT_MS = 10 * 60 * 1000;

const notationMutateHelper = useNotationMutateHelper();
const lessonStore = useLessonStore();
const userStore = useUserStore();
const cellStore = useCellStore();

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const dialog = ref(false);
const uploadImageUrl = ref("");
const sessionError = ref("");
const sessionStatus = ref<
  | "idle"
  | "preparing"
  | "waiting"
  | "processing"
  | "received"
  | "error"
  | "timeout"
>("idle");

const snackbar = ref({ show: false, text: "", color: "success" });

let sessionTimeoutId: ReturnType<typeof setTimeout> | undefined;
let imageUpdatedHandler: ((data: { base64?: string; lessonUUId?: string }) => void) | null =
  null;
let feathersClient: ReturnType<typeof FeathersHelper.getInstance> | null = null;

const hasSelectedCell = computed(() => !!cellStore.getSelectedCell());

const isLocalhost = computed(() => {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
});

const canShowQr = computed(
  () =>
    !sessionError.value &&
    hasSelectedCell.value &&
    uploadImageUrl.value &&
    (sessionStatus.value === "preparing" ||
      sessionStatus.value === "waiting" ||
      sessionStatus.value === "timeout"),
);

const statusChip = computed(() => {
  switch (sessionStatus.value) {
    case "preparing":
      return { color: "warning", icon: "mdi-progress-clock", text: "Preparing…" };
    case "waiting":
      return {
        color: "info",
        icon: "mdi-cellphone",
        text: "Waiting for photo from phone",
      };
    case "processing":
      return {
        color: "success",
        icon: "mdi-progress-upload",
        text: "Placing photo on the board…",
      };
    case "received":
      return { color: "success", icon: "mdi-check", text: "Photo received" };
    case "timeout":
      return {
        color: "warning",
        icon: "mdi-timer-off",
        text: "Timed out — open again to retry",
      };
    case "error":
      return { color: "error", icon: "mdi-alert", text: "Session error" };
    default:
      return { color: "grey", icon: "mdi-qrcode", text: "Ready" };
  }
});

watch(
  () => props.show,
  (open) => {
    dialog.value = open;
    if (open) {
      void startLoadingImageSession();
    } else {
      teardownSession();
    }
  },
);

function showSnackbar(text: string, color: string) {
  snackbar.value = { show: true, text, color };
}

function buildUploadUrl(lessonUUId: string, userUUId: string): string {
  return `${window.location.origin}/uploadPhoto/${lessonUUId}/${userUUId}`;
}

async function copyUploadLink() {
  if (!uploadImageUrl.value) return;
  try {
    await navigator.clipboard.writeText(uploadImageUrl.value);
    showSnackbar("Link copied", "success");
  } catch {
    showSnackbar("Could not copy link", "error");
    void logCrossDeviceUpload("desktop", "copy_link_failed");
  }
}

function clearSessionTimeout() {
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId);
    sessionTimeoutId = undefined;
  }
}

function removeImageListener() {
  if (feathersClient && imageUpdatedHandler) {
    feathersClient.service("imageLoaded").off("updated", imageUpdatedHandler);
  }
  imageUpdatedHandler = null;
}

function teardownSession() {
  clearSessionTimeout();
  removeImageListener();
  sessionStatus.value = "idle";
}

function closeDialog() {
  teardownSession();
  emit("close");
}

async function startLoadingImageSession() {
  teardownSession();
  sessionError.value = "";
  sessionStatus.value = "preparing";
  uploadImageUrl.value = "";

  const lesson = lessonStore.getCurrentLesson();
  const user = userStore.getCurrentUser();
  const lessonUUId = lesson?.uuid;
  const userUUId = user?.uuid;

  if (!lessonUUId || !userUUId) {
    sessionError.value = "Lesson or user is not loaded. Save the lesson and try again.";
    sessionStatus.value = "error";
    void logCrossDeviceUpload("desktop", "missing_lesson_or_user", {
      lessonUUId,
      userUUId,
    });
    return;
  }

  if (
    !isValidUploadSessionId(lessonUUId) ||
    !isValidUploadSessionId(userUUId)
  ) {
    sessionError.value = "Invalid lesson or user id.";
    sessionStatus.value = "error";
    void logCrossDeviceUpload("desktop", "invalid_session_ids", {
      lessonUUId,
      userUUId,
    });
    return;
  }

  if (!hasSelectedCell.value) {
    sessionStatus.value = "waiting";
    void logCrossDeviceUpload("desktop", "no_cell_selected");
  }

  uploadImageUrl.value = buildUploadUrl(lessonUUId, userUUId);

  try {
    feathersClient = FeathersHelper.getInstance();
    await FeathersHelper.waitUntilConnected();
    await FeathersHelper.ensureLessonChannel(lessonUUId);

    imageUpdatedHandler = async (eventData: unknown) => {
      if (
        sessionStatus.value === "received" ||
        sessionStatus.value === "processing"
      ) {
        return;
      }

      const data = extractImageLoadedPayload(eventData);

      if (!data.base64) {
        void logCrossDeviceUpload("desktop", "received_empty_payload", {
          raw: eventData,
        });
        sessionError.value = "Received an empty image from the phone.";
        sessionStatus.value = "error";
        removeImageListener();
        clearSessionTimeout();
        return;
      }

      if (data.lessonUUId && data.lessonUUId !== lessonUUId) {
        void logCrossDeviceUpload("desktop", "lesson_mismatch", {
          expected: lessonUUId,
          received: data.lessonUUId,
        });
        return;
      }

      if (!cellStore.getSelectedCell()) {
        sessionError.value =
          "Photo arrived but no cell is selected. Select a cell and upload again.";
        sessionStatus.value = "error";
        removeImageListener();
        clearSessionTimeout();
        void logCrossDeviceUpload("desktop", "photo_arrived_no_cell_selected");
        return;
      }

      sessionStatus.value = "processing";
      clearSessionTimeout();
      removeImageListener();

      try {
        await notationMutateHelper.addImageNotation(data.base64);
        sessionStatus.value = "received";
        showSnackbar("Photo added to the board", "success");
        setTimeout(() => closeDialog(), 800);
      } catch (error) {
        sessionError.value = "Could not place the image on the board.";
        sessionStatus.value = "error";
        void logCrossDeviceUpload(
          "desktop",
          "add_image_notation_failed",
          error instanceof Error ? error.message : String(error),
        );
      }
    };

    feathersClient
      .service("imageLoaded")
      .on("updated", imageUpdatedHandler);

    sessionStatus.value = "waiting";

    sessionTimeoutId = setTimeout(() => {
      if (sessionStatus.value === "waiting") {
        sessionStatus.value = "timeout";
        void logCrossDeviceUpload("desktop", "session_timeout", {
          lessonUUId,
        });
      }
    }, SESSION_TIMEOUT_MS);
  } catch (error) {
    sessionError.value =
      "Could not connect to the messaging server. Check that math-messages is running.";
    sessionStatus.value = "error";
    void logCrossDeviceUpload(
      "desktop",
      "session_start_failed",
      error instanceof Error ? error.message : String(error),
    );
  }
}

onUnmounted(() => {
  teardownSession();
});
</script>

<style scoped>
.cross-device-upload-dialog {
  max-width: 600px;
}
</style>
