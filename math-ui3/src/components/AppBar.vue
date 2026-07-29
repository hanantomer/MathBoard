<template>
  <NewBoardItemDialog
    :dialog="renameDialog"
    :title="renameDialogTitle"
    :initial-name="renameInitialName"
    @close="renameDialog = false"
    @save="saveRename"
  />

  <v-app-bar app color="primary" dark dense elevation="8" class="app-bar" >
    <v-img
      class="mx-2"
      :src="betaImg"
      max-height="35"
      max-width="35"
      contain
      style="max-width: 35px; width: 100%; height: auto"
    ></v-img>
    <v-img
      class="mx-2"
      :src="logoImg"
      max-height="65"
      max-width="85"
      contain
    ></v-img>
    <v-toolbar-title class="app-bar__title">
      <span class="app-bar__brand d-none d-lg-inline"
        >ONLINE <strong style="color: darkorange">MATH WHITEBOARD</strong></span
      >
      <div
        v-if="boardContext.level !== 'none'"
        class="app-bar__context"
      >
        <v-chip
          size="x-small"
          :color="boardContext.chipColor"
          variant="flat"
          class="app-bar__chip"
        >
          {{ boardContext.chipLabel }}
        </v-chip>
        <span class="app-bar__breadcrumb">
          <template
            v-for="(crumb, index) in boardContext.breadcrumbs"
            :key="`${crumb.text}-${index}`"
          >
            <button
              v-if="isRenameableCrumb(index)"
              type="button"
              class="app-bar__crumb-link app-bar__crumb-rename"
              data-cy="app-bar-rename-crumb"
              :aria-label="`Rename ${boardContext.level}`"
              :title="`Rename ${boardContext.level}`"
              @click="openRenameFromCrumb(index)"
            >
              {{ crumb.text }}
            </button>
            <router-link
              v-else-if="crumb.to"
              :to="crumb.to"
              class="app-bar__crumb-link"
            >
              {{ crumb.text }}
            </router-link>
            <span v-else class="app-bar__crumb-text">{{ crumb.text }}</span>
            <span
              v-if="index < boardContext.breadcrumbs.length - 1"
              class="app-bar__sep"
              aria-hidden="true"
            >
              ›
            </span>
          </template>
        </span>
      </div>
    </v-toolbar-title>

    <!-- Media bar temporarily disabled (TURN not configured). -->
    <!-- <lessonMediaBar></lessonMediaBar> -->

    <!-- lessons -->
    <v-tooltip text="Lessons" location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn
          data-cy="lessons"
          v-show="showLessons"
          icon
          v-on:click="navToLessons"
          v-bind="props"
        >
          <v-icon>mdi-archive-edit-outline</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <!-- practice (question bank, no lesson) -->
    <v-tooltip text="Practice" location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn
          data-cy="practice"
          v-show="showPractice"
          icon
          v-on:click="navToPractice"
          v-bind="props"
        >
          <v-icon>mdi-school-outline</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <!-- questions -->
    <v-tooltip text="Questions" location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn
          v-show="showQuestions"
          icon
          v-on:click="navToQuestions"
          v-bind="props"
        >
          <v-icon>mdi-message-question-outline</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <!-- answers -->
    <v-tooltip text="Answers" location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn
          v-show="showAnswers"
          icon
          v-on:click="navToAnswers"
          v-bind="props"
        >
          <v-icon>mdi-checkbox-marked-outline</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip
      v-if="showLessonInvite"
      :text="inviteTooltip"
      location="bottom"
    >
      <template v-slot:activator="{ props: inviteProps }">
        <v-btn
          id="invite-btn"
          v-bind="inviteProps"
          class="app-bar__invite-btn d-none d-sm-flex"
          color="orange"
          variant="flat"
          size="small"
          prepend-icon="mdi-link-variant"
          @click="openInviteDialog"
        >
          <span class="d-none d-md-inline">Invite</span>
        </v-btn>
      </template>
    </v-tooltip>

    <!-- students -->
    <span
      v-if="showOnlineStudents"
      class="app-bar__students-label d-none d-lg-inline"
    >
      Students
    </span>
    <v-tooltip
      text="Online Students — who joined and board editing"
      location="bottom"
    >
      <template v-slot:activator="{ props: tooltipProps }">
        <v-badge
          :content="onlineStudentsCount"
          :model-value="onlineStudentsCount > 0"
          color="green"
          overlap
        >
          <v-btn
            id="online-students-btn"
            data-cy="online_students_btn"
            v-show="showOnlineStudents"
            icon
            class="app-bar__students-btn"
            :class="{
              'app-bar__students-btn--highlight': highlightOnlineStudents,
            }"
            aria-label="Online students"
            v-on:click="showOnlineStudentsDialog"
            v-bind="tooltipProps"
          >
            <v-icon>mdi-account-school-outline</v-icon>
          </v-btn>
        </v-badge>
      </template>
    </v-tooltip>

    <v-tooltip text="Help" location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn
          v-show="user"
          id="help-btn"
          icon
          v-bind="props"
          aria-label="Help"
          @click="openHelp"
        >
          <v-icon>mdi-help-circle-outline</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip text="Send Feedback" location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn
          data-cy="send_feedback"
          v-bind="props"
          class="feedback-btn"
          color="orange"
          variant="flat"
          size="small"
          @click="emit('show-feedback')"
        >
          <v-icon start>mdi-message-outline</v-icon>
          <span class="d-none d-md-inline">Feedback</span>
        </v-btn>
      </template>
    </v-tooltip>

    <!-- sign in / register -->
    <v-tooltip text="Sign in as Teacher" location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          v-show="!user"
          icon
          v-on:click="showLoginDialog('TEACHER')"
        >
          <v-icon>mdi-account-tie</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip text="Sign in as Student" location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          v-show="!user"
          icon
          v-on:click="showLoginDialog('STUDENT')"
        >
          <v-icon>mdi-account-school-outline</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <v-divider class="mx-6" vertical></v-divider>

    <!-- user image or name -->
    <v-tooltip bottom hidden>
      <template v-slot:activator="{ props }">
        <v-avatar v-show="user?.imageUrl" size="36px"
          ><img v-bind:src="user?.imageUrl"
        /></v-avatar>
      </template>
      <span v-show="user?.firstName">{{ user?.firstName }}</span>
    </v-tooltip>

    <span v-show="user?.firstName && !user?.imageUrl"
      >Hello {{ user?.firstName }}</span
    >

    <v-tooltip text="Sign Out" location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn v-show="user" icon v-on:click="signOut" v-bind="props">
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </template>
    </v-tooltip>
  </v-app-bar>
</template>

<script setup lang="ts">
import betaImg from "@/assets/beta.png";
import logoImg from "@/assets/logo.png";
import { useRouter, useRoute } from "vue-router";
import { COLLABORATION } from "../constants/helpCopy";
import { computed, ref } from "vue";
import { useUserStore } from "../store/pinia/userStore";
import { useBoardContextStore } from "../store/pinia/boardContextStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useQuestionStore } from "../store/pinia/questionStore";
import { useGlobalAlertStore } from "../store/pinia/globalAlertStore";
import NewBoardItemDialog from "./NewBoardItemDialog.vue";
import { useUiHintStore } from "../store/pinia/uiHintStore";
import { storeToRefs } from "pinia";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useStudentStore } from "../store/pinia/studentStore";
import { useCookies } from "vue3-cookies";
import { useOnboardingStore } from "../store/pinia/onboardingStore";
import { ACCESS_TOKEN_NAME } from "common/globals";
// import LessonMediaBar from "./LessonMediaBar.vue";

const emit = defineEmits<{
  "show-feedback": [];
}>();

const cookies = useCookies().cookies;
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const inviteTooltip = COLLABORATION.inviteTooltip;
const boardContext = useBoardContextStore();
const lessonStore = useLessonStore();
const questionStore = useQuestionStore();
const globalAlertStore = useGlobalAlertStore();
const uiHintStore = useUiHintStore();
const renameDialog = ref(false);
const renameDialogTitle = ref("");
const renameInitialName = ref("");
const renameTargetUuid = ref("");
const renameTargetType = ref<"lesson" | "question">("lesson");
const { highlightOnlineStudentsBtn: highlightOnlineStudents } =
  storeToRefs(uiHintStore);
const editModeStrore = useEditModeStore();
const studentStore = useStudentStore();
const onboardingStore = useOnboardingStore();

const onlineStudentsCount = computed(() => {
  return studentStore.getStudents().length;
});

const user = computed(() => {
  return userStore.getCurrentUser();
});

const showLessons = computed(() => {
  return user.value;
});

const showQuestions = computed(() => {
  return userStore.getCurrentUser();
});

const showPractice = computed(() => {
  return true;
});

const showAnswers = computed(() => {
  return isTeacher.value;
});

const showOnlineStudents = computed(() => {
  return isTeacher.value;
});

const isTeacher = computed(() => userStore.isTeacher());

const showLessonInvite = computed(
  () => route.name === "lesson" && isTeacher.value,
);

function openInviteDialog() {
  uiHintStore.requestAccessLinkDialog();
}

function openHelp() {
  onboardingStore.openHelpDrawer();
}

function showLoginDialog(userType?: string) {
  if (userType) {
    router.push({ name: "login", query: { userType } });
  } else {
    router.push("/login");
  }
}

function signOut() {
  boardContext.clear();
  userStore.setCurrentUser(null);
  cookies.remove(ACCESS_TOKEN_NAME);
  router.push("/");
}

function showOnlineStudentsDialog() {
  editModeStrore.setEditMode("STUDENTS_MONITORING");
}

function navToLessons() {
  router.push("/lessons");
}

function navToQuestions() {
  router.push("/questions");
}

function navToPractice() {
  router.push("/practice");
}

function navToAnswers() {
  router.push("/answers");
}

function isRenameableCrumb(index: number): boolean {
  if (!isTeacher.value) {
    return false;
  }
  const last = boardContext.breadcrumbs.length - 1;
  if (index !== last) {
    return false;
  }
  return boardContext.level === "lesson" || boardContext.level === "question";
}

function openRenameFromCrumb(index: number) {
  const crumb = boardContext.breadcrumbs[index];
  if (!crumb || !isRenameableCrumb(index)) {
    return;
  }

  if (boardContext.level === "lesson") {
    const lessonUUId =
      (route.params.lessonUUId as string | undefined) ??
      crumb.to?.params?.lessonUUId;
    if (!lessonUUId) {
      return;
    }
    renameTargetType.value = "lesson";
    renameTargetUuid.value = lessonUUId;
    renameDialogTitle.value = "<span>Rename <strong>lesson</strong></span>";
  } else {
    const questionUUId =
      (route.params.questionUUId as string | undefined) ??
      crumb.to?.params?.questionUUId;
    if (!questionUUId) {
      return;
    }
    renameTargetType.value = "question";
    renameTargetUuid.value = questionUUId;
    renameDialogTitle.value = "<span>Rename <strong>question</strong></span>";
  }

  renameInitialName.value = crumb.text;
  renameDialog.value = true;
}

async function saveRename(name: string) {
  const trimmed = name?.trim();
  if (!trimmed || !renameTargetUuid.value) {
    return;
  }
  renameDialog.value = false;

  try {
    if (renameTargetType.value === "lesson") {
      const updated = await lessonStore.updateLesson(
        renameTargetUuid.value,
        trimmed,
      );
      boardContext.setLesson(updated.name, updated.uuid);
    } else {
      const updated = await questionStore.updateQuestion(
        renameTargetUuid.value,
        trimmed,
      );
      if (updated.lesson) {
        boardContext.setQuestion(
          updated.lesson.name,
          updated.lesson.uuid,
          updated.name,
          updated.uuid,
        );
      } else if (updated.practice) {
        boardContext.setPracticeQuestionEditor(
          updated.practice.subject,
          updated.name,
          updated.uuid,
        );
      }
    }
  } catch (error) {
    globalAlertStore.open(
      "Rename failed",
      (error as Error).message,
      "error",
      () => {},
    );
  }
}
</script>

<style scoped>
.app-bar__title {
  overflow: hidden;
  min-width: 0;
}

.app-bar__brand {
  white-space: nowrap;
  margin-right: 12px;
}

.app-bar__context {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
  margin-left: 8px;
}

.app-bar__chip {
  flex-shrink: 0;
  font-weight: 700;
}

.app-bar__breadcrumb {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.95rem;
}

.app-bar__crumb-link {
  color: rgba(255, 255, 255, 0.95);
  text-decoration: none;
}

.app-bar__crumb-link:hover {
  text-decoration: underline;
}

.app-bar__crumb-rename {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
}

.app-bar__crumb-text {
  color: rgba(255, 255, 255, 0.85);
}

.app-bar__sep {
  margin: 0 4px;
  opacity: 0.75;
}

.app-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding-top: env(safe-area-inset-top);
}

.feedback-btn {
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: none;
}

.app-bar__students-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.85;
  margin-right: 2px;
}

.app-bar__invite-btn {
  margin-right: 4px;
}

.app-bar__students-btn--highlight {
  animation: students-btn-pulse 1.1s ease-in-out 3;
  box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.95);
  border-radius: 50%;
}

@keyframes students-btn-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.12);
  }
}

@media (max-width: 1023px) {
  .app-bar__context {
    margin-left: 0;
    max-width: min(52vw, 260px);
  }

  .app-bar__breadcrumb {
    font-size: 0.85rem;
  }

  .app-bar :deep(.v-toolbar__content) {
    padding-inline: 4px;
  }

  .app-bar :deep(.v-btn--icon) {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>
