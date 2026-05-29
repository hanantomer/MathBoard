<template>
  <v-overlay
    :model-value="visible"
    contained
    class="board-empty-overlay align-center justify-center"
    persistent
    scrim="rgba(0,0,0,0.35)"
  >
    <v-card class="board-empty-overlay__card pa-6 text-center" max-width="420" rounded="lg">
      <v-icon size="48" color="primary" class="mb-3">mdi-draw</v-icon>
      <div class="text-h6 mb-2">{{ COLLABORATION.emptyLessonTitle }}</div>
      <p class="text-body-2 text-medium-emphasis mb-4">
        {{ COLLABORATION.emptyLessonBody }}
      </p>
      <v-btn color="primary" variant="flat" @click="openInvite">
        <v-icon start>mdi-link-variant</v-icon>
        {{ COLLABORATION.copyLink }}
      </v-btn>
      <v-btn
        class="ml-2"
        variant="outlined"
        data-cy="empty-lesson-dismiss"
        @click="dismiss"
      >
        Start drawing
      </v-btn>
    </v-card>
  </v-overlay>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "../store/pinia/userStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { useUiHintStore } from "../store/pinia/uiHintStore";
import { useOnboardingStore } from "../store/pinia/onboardingStore";
import { COLLABORATION } from "../constants/helpCopy";

const props = defineProps<{
  loaded?: boolean;
}>();

const route = useRoute();
const userStore = useUserStore();
const notationStore = useNotationStore();
const uiHintStore = useUiHintStore();
const onboardingStore = useOnboardingStore();

const dismissedLocally = ref(false);

watch(
  () => notationStore.getNotations().length,
  (len) => {
    if (len > 0) {
      dismissedLocally.value = true;
    }
  },
);

const visible = computed(
  () =>
    props.loaded &&
    !dismissedLocally.value &&
    !onboardingStore.emptyLessonOverlayDismissed &&
    route.name === "lesson" &&
    userStore.isTeacher() &&
    notationStore.getNotations().length === 0,
);

function openInvite() {
  uiHintStore.requestAccessLinkDialog();
}

function dismiss() {
  dismissedLocally.value = true;
  onboardingStore.dismissEmptyLessonOverlay();
}
</script>

<style scoped>
.board-empty-overlay__card {
  background: #fff;
}
</style>
