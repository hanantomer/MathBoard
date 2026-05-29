<template>
  <v-navigation-drawer
    :model-value="onboarding.helpDrawerOpen"
    location="right"
    temporary
    width="360"
    class="help-drawer"
    @update:model-value="onDrawerToggle"
  >
    <div class="help-drawer__header pa-4 d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-help-circle-outline</v-icon>
      <span class="text-h6 flex-grow-1">Help</span>
      <v-btn
        icon
        variant="text"
        size="small"
        data-cy="help-drawer-close"
        aria-label="Close"
        @click="close"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <v-tabs v-model="tab" density="compact" color="primary" class="px-2">
      <v-tab value="collaborate">Collaborate</v-tab>
      <v-tab value="tools">Tools</v-tab>
      <v-tab value="page">This page</v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab" class="help-drawer__body pa-4">
      <v-tabs-window-item value="collaborate">
        <h3 class="text-subtitle-1 font-weight-bold mb-2">
          {{ collabTitle }}
        </h3>
        <v-list density="compact" class="pa-0">
          <v-list-item
            v-for="(step, i) in collabSteps"
            :key="i"
            class="px-0"
          >
            <template #prepend>
              <v-avatar size="24" color="primary" class="mr-2">
                <span class="text-caption">{{ i + 1 }}</span>
              </v-avatar>
            </template>
            <v-list-item-title class="text-body-2">{{ step }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-tabs-window-item>

      <v-tabs-window-item value="tools">
        <h3 class="text-subtitle-1 font-weight-bold mb-1">
          {{ TOOLS_HELP.title }}
        </h3>
        <p class="text-body-2 text-medium-emphasis mb-3">
          {{ TOOLS_HELP.intro }}
        </p>
        <div v-for="group in TOOLS_HELP.groups" :key="group.name" class="mb-3">
          <div class="text-caption font-weight-bold text-uppercase mb-1">
            {{ group.name }}
          </div>
          <ul class="help-drawer__list text-body-2 pl-4">
            <li v-for="tool in group.tools" :key="tool">{{ tool }}</li>
          </ul>
        </div>
        <p class="text-caption text-medium-emphasis">{{ EDITING_BASICS.exitHint }}</p>
      </v-tabs-window-item>

      <v-tabs-window-item value="page">
        <h3 class="text-subtitle-1 font-weight-bold mb-2">
          {{ pageHelp.title }}
        </h3>
        <p
          v-for="(line, i) in pageHelp.lines"
          :key="i"
          class="text-body-2 mb-2"
        >
          {{ line }}
        </p>
      </v-tabs-window-item>
    </v-tabs-window>

    <div class="help-drawer__footer pa-4">
      <v-btn
        href="https://www.youtube.com/watch?v=8bXmQ2KoIrI"
        target="_blank"
        variant="tonal"
        color="orange"
        block
        prepend-icon="mdi-youtube"
      >
        Watch tutorial video
      </v-btn>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useOnboardingStore } from "../store/pinia/onboardingStore";
import { useUserStore } from "../store/pinia/userStore";
import { useBoardContextStore } from "../store/pinia/boardContextStore";
import {
  COLLAB_HELP,
  TOOLS_HELP,
  EDITING_BASICS,
  boardContextToHelpKey,
  getPageHelp,
  BOARD_ROLE_BANNERS,
  LIST_INTROS,
} from "../constants/helpCopy";

const onboarding = useOnboardingStore();
const userStore = useUserStore();
const boardContext = useBoardContextStore();
const tab = ref("collaborate");

const collabTitle = computed(() =>
  userStore.isTeacher()
    ? COLLAB_HELP.teacherTitle
    : COLLAB_HELP.studentTitle,
);

const collabSteps = computed(() =>
  userStore.isTeacher()
    ? COLLAB_HELP.teacherSteps
    : COLLAB_HELP.studentSteps,
);

const pageHelp = computed(() => {
  const key = boardContextToHelpKey(boardContext.level);
  const base = getPageHelp(key);
  if (!userStore.isTeacher() && key === "question") {
    return {
      title: base.title,
      lines: [BOARD_ROLE_BANNERS.questionStudent, LIST_INTROS.questions],
    };
  }
  if (!userStore.isTeacher() && key === "answer") {
    return {
      title: base.title,
      lines: [BOARD_ROLE_BANNERS.answerStudent],
    };
  }
  return base;
});

function close() {
  onboarding.closeHelpDrawer();
}

function onDrawerToggle(open: boolean) {
  if (!open) {
    close();
  }
}
</script>

<style scoped>
.help-drawer__header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.help-drawer__body {
  overflow-y: auto;
  max-height: calc(100vh - 220px);
}

.help-drawer__list {
  margin: 0;
}

.help-drawer__footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
}
</style>
