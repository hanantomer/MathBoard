<template>
  <v-container class="lessons-page">
    <NewBoardItemDialog
      :dialog="lessonDialog"
      :title="lessonDialogTitle"
      @close="lessonDialog = false"
      @save="addLesson"
    ></NewBoardItemDialog>
    <NewBoardItemDialog
      :dialog="renameDialog"
      :title="renameDialogTitle"
      :initial-name="renameInitialName"
      @close="renameDialog = false"
      @save="saveLessonRename"
    ></NewBoardItemDialog>
    <LessonLibraryDialog
      v-model="libraryDialog"
      ref="libraryDialogRef"
      @select="addLessonFromLibrary"
    />
    <v-card class="mx-auto mt-4" max-width="800" min-height="600">
      <v-card-text class="text-body-2 text-medium-emphasis pb-0">
        {{ listIntro }}
      </v-card-text>
      <v-toolbar color="primary" dark>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-tooltip text="Add a sample lesson from the library" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              data-cy="lesson-library"
              icon
              class="mr-1"
              v-on:click="openLibraryDialog"
              v-show="userStore.isTeacher()"
              v-bind="props"
            >
              <v-icon>mdi-bookshelf</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Create a new lesson" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              data-cy="add-lesson"
              icon
              v-on:click="openLessonDialog"
              v-show="userStore.isTeacher()"
              v-bind="props"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </v-toolbar>
      <v-data-table
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="lessons"
        item-value="uuid"
        class="elevation-1"
        :class="{ 'lessons-table--locked': isLessonListBusy }"
        @click:row="selectLesson"
        :hide-no-data="true"
        :hover="!isLessonListBusy"
        :loading="isLessonListBusy"
        height="400"
        density="compact"
        fixed-header
      >
        <template v-if="userStore.isTeacher()" #item.actions="{ item }">
          <v-btn
            icon
            variant="text"
            size="small"
            aria-label="Rename lesson"
            :disabled="isLessonListBusy"
            @click.stop="openRenameDialog(rowItem(item))"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            variant="text"
            size="small"
            aria-label="Delete lesson"
            :disabled="isLessonListBusy"
            @click.stop="confirmDeleteLesson(rowItem(item))"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
import NewBoardItemDialog from "./NewBoardItemDialog.vue";
import LessonLibraryDialog from "./LessonLibraryDialog.vue";
import { formatDate } from "common/globals";
import { LessonAttributes } from "common/lessonTypes";
import { useUserStore } from "../store/pinia/userStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useBoardContextStore } from "../store/pinia/boardContextStore";
import { useQuestionStore } from "../store/pinia/questionStore";
import { useAnswerStore } from "../store/pinia/answerStore";
import { useGlobalAlertStore } from "../store/pinia/globalAlertStore";
import { watch, ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import { LIST_INTROS } from "../constants/helpCopy";
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const lessonStore = useLessonStore();
const editModeStore = useEditModeStore();
const boardContext = useBoardContextStore();
const questionStore = useQuestionStore();
const answerStore = useAnswerStore();
const globalAlertStore = useGlobalAlertStore();
const title = computed(() => {
  return userStore.isTeacher() ? "Lessons" : "Lessons Shared with me";
});

const listIntro = computed(() =>
  userStore.isTeacher()
    ? LIST_INTROS.lessonsTeacher
    : LIST_INTROS.lessonsStudent,
);
let lessonDialog = ref(false);
let libraryDialog = ref(false);
const libraryDialogRef = ref<InstanceType<typeof LessonLibraryDialog> | null>(
  null,
);
let lessonDialogTitle =
  "<span>Please specify <strong>lesson</strong> title</span";
const renameDialog = ref(false);
const renameDialogTitle =
  "<span>Rename <strong>lesson</strong></span>";
const renameInitialName = ref("");
const renameLessonUUId = ref("");
let itemsPerPage = 10;
let isMounted = true;
const creatingLesson = ref(false);

const isLessonListBusy = computed(
  () => creatingLesson.value || lessonStore.isLessonListNavigationLocked(),
);

onMounted(async () => {
  await lessonStore.loadLessons();

  if (!isMounted || route.name !== "lessons") {
    return;
  }

  const pendingCreatedLessonUUId = lessonStore.getPendingOpenLessonUUId();
  if (pendingCreatedLessonUUId) {
    await router.replace({
      name: "lesson",
      params: { lessonUUId: pendingCreatedLessonUUId },
    });
    return;
  }

});

onUnmounted(() => {
  isMounted = false;
});

watch(
  route,
  async () => {
    editModeStore.setEditMode("LESSONS_SELECTION");
    boardContext.setLessonsList();
  },
  { immediate: true },
);

const headers = computed(() => {
  const cols = [
    {
      title: "Name",
      key: "name",
      sortable: false,
    },
    {
      title: "Created on",
      key: "createdAt",
      sortable: false,
    },
  ];
  if (userStore.isTeacher()) {
    cols.push({
      title: "Actions",
      key: "actions",
      sortable: false,
      width: 96,
    } as (typeof cols)[number]);
  }
  return cols;
});

const lessons = computed(() => {
  let rows = Array.from(lessonStore.getLessons().values()).map(
    (l: LessonAttributes) => {
      return {
        uuid: l.uuid,
        name: l.name,
        createdAt: formatDate(l.createdAt),
      };
    },
  );
  return rows;
});

function openLessonDialog() {
  lessonDialog.value = true;
}

function openLibraryDialog() {
  libraryDialog.value = true;
}

async function addLessonFromLibrary(templateId: string) {
  libraryDialog.value = false;
  creatingLesson.value = true;
  try {
    const savedLesson = await lessonStore.addLessonFromTemplate(templateId);
    lessonStore.beginOpeningLesson(savedLesson.uuid);
    await router.replace({
      name: "lesson",
      params: { lessonUUId: savedLesson.uuid },
    });
  } catch (error) {
    lessonStore.finishOpeningLesson();
    globalAlertStore.open(
      "Could not add lesson",
      (error as Error).message,
      "error",
      () => {},
    );
  } finally {
    creatingLesson.value = false;
    libraryDialogRef.value?.clearLoading();
  }
}

async function addLesson(lessonName: string) {
  const name = lessonName?.trim();
  if (!name) {
    return;
  }

  lessonDialog.value = false;
  creatingLesson.value = true;
  try {
    const savedLesson = await lessonStore.addLesson(name);
    lessonStore.beginOpeningLesson(savedLesson.uuid);
    await router.replace({
      name: "lesson",
      params: { lessonUUId: savedLesson.uuid },
    });
  } finally {
    creatingLesson.value = false;
  }
}

type ListRow = { uuid: string; name: string };

function rowItem(item: unknown): ListRow {
  const row = item as ListRow & { raw?: ListRow };
  return row.raw ?? row;
}

function openRenameDialog(item: ListRow) {
  renameLessonUUId.value = item.uuid;
  renameInitialName.value = item.name;
  renameDialog.value = true;
}

async function saveLessonRename(lessonName: string) {
  const name = lessonName?.trim();
  if (!name || !renameLessonUUId.value) {
    return;
  }
  renameDialog.value = false;
  try {
    await lessonStore.updateLesson(renameLessonUUId.value, name);
    await lessonStore.loadLessons();
    if (
      route.name === "lesson" &&
      route.params.lessonUUId === renameLessonUUId.value
    ) {
      boardContext.setLesson(name, renameLessonUUId.value);
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

function confirmDeleteLesson(item: ListRow) {
  globalAlertStore.open(
    "Delete lesson?",
    `Delete "<strong>${item.name}</strong>" and all its questions and student answers? This cannot be undone.`,
    "warning",
    async () => {
      try {
        await lessonStore.deleteLesson(item.uuid);
        const removedQuestionIds =
          questionStore.removeQuestionsForLesson(item.uuid);
        removedQuestionIds.forEach((questionUUId) =>
          answerStore.removeAnswersForQuestion(questionUUId),
        );
        await lessonStore.loadLessons();
        const onDeletedLesson =
          (route.name === "lesson" &&
            route.params.lessonUUId === item.uuid) ||
          questionStore.getCurrentQuestion()?.lesson?.uuid === item.uuid;
        if (onDeletedLesson) {
          await router.replace({ name: "lessons" });
        }
      } catch (error) {
        globalAlertStore.open(
          "Delete failed",
          (error as Error).message,
          "error",
          () => {},
        );
      }
    },
  );
}

async function selectLesson(e: any, row: any) {
  e.stopPropagation();
  if (isLessonListBusy.value) {
    const pending = lessonStore.getPendingOpenLessonUUId();
    if (pending && pending === row.item.uuid) {
      await router.replace({
        name: "lesson",
        params: { lessonUUId: pending },
      });
    }
    return;
  }

  router.push({
    path: "/lesson/" + row.item.uuid,
  });
}
</script>

<style scoped>
.lessons-page {
  padding-top: 80px;
}

.lesson_title {
  justify-content: left !important;
}

.lessons-table--locked {
  pointer-events: none;
  opacity: 0.72;
}
</style>

