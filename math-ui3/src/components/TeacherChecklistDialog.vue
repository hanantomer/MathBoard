<template>
  <v-dialog v-model="open" max-width="440" persistent>
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center ga-2 pt-4 px-4">
        <v-icon color="primary">mdi-school-outline</v-icon>
        {{ CHECKLIST.title }}
      </v-card-title>
      <v-card-subtitle class="px-4 pb-2">
        {{ CHECKLIST.subtitle }}
      </v-card-subtitle>
      <v-card-text class="px-4">
        <v-list density="compact" class="pa-0">
          <v-list-item
            v-for="(step, index) in CHECKLIST.steps"
            :key="step.id"
            class="px-0"
          >
            <template #prepend>
              <v-avatar color="primary" size="28">
                {{ index + 1 }}
              </v-avatar>
            </template>
            <v-list-item-title class="text-body-1">{{
              step.label
            }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions class="px-4 pb-4 flex-wrap ga-2">
        <v-btn variant="text" data-cy="teacher-checklist-dont-show" @click="dontShowAgain">
          {{ CHECKLIST.dontShowAgain }}
        </v-btn>
        <v-spacer />
        <v-btn variant="outlined" @click="gotItOnly">
          {{ CHECKLIST.gotIt }}
        </v-btn>
        <v-btn color="primary" variant="flat" @click="gotItAndTour">
          {{ CHECKLIST.showTour }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "../store/pinia/userStore";
import { useOnboardingStore } from "../store/pinia/onboardingStore";
import { CHECKLIST } from "../constants/helpCopy";

const route = useRoute();
const userStore = useUserStore();
const onboarding = useOnboardingStore();
const open = ref(false);

watch(
  () => [route.name, userStore.isTeacher(), onboarding.shouldShowTeacherChecklist] as const,
  ([name, isTeacher, shouldShow]) => {
    if (name === "lesson" && isTeacher && shouldShow) {
      setTimeout(() => {
        open.value = true;
      }, 800);
    }
  },
  { immediate: true },
);

function closeDialog() {
  open.value = false;
}

function dontShowAgain() {
  onboarding.dismissTeacherChecklist();
  closeDialog();
  setTimeout(() => onboarding.tryStartQuickTipsTour(), 500);
}

function gotItOnly() {
  onboarding.dismissTeacherChecklist();
  closeDialog();
  setTimeout(() => onboarding.tryStartQuickTipsTour(), 500);
}

function gotItAndTour() {
  onboarding.dismissTeacherChecklist();
  closeDialog();
  setTimeout(() => onboarding.startLessonTour(), 400);
}
</script>
