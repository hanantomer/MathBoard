<template>
  <v-container class="lessons-page">
    <NewBoardItemDialog
      :dialog="lessonDialog"
      :title="lessonDialogTitle"
      @close="lessonDialog = false"
      @save="addLesson"
    ></NewBoardItemDialog>
    <v-card class="mx-auto mt-4" max-width="800" min-height="600">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-spacer></v-spacer>
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
        item-value="name"
        class="elevation-1"
        :class="{ 'lessons-table--locked': isLessonListBusy }"
        @click:row="selectLesson"
        :hide-no-data="true"
        :hover="!isLessonListBusy"
        :loading="isLessonListBusy"
        height="400"
        density="compact"
        fixed-header
      ></v-data-table>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
import NewBoardItemDialog from "./NewBoardItemDialog.vue";
import { formatDate } from "common/globals";
import { LessonAttributes } from "common/lessonTypes";
import { useUserStore } from "../store/pinia/userStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { watch, ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const lessonStore = useLessonStore();
const editModeStore = useEditModeStore();
const title = computed(() => {
  return userStore.isTeacher() ? "Lessons" : "Lessons Shared with me";
});
let lessonDialog = ref(false);
let lessonDialogTitle =
  "<span>Please specify <strong>lesson</strong> title</span";
const menu = [{ icon: "plus", title: "Add" }];
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

  if (lessonStore.getLessons().size === 0 && userStore.isTeacher()) {
    openLessonDialog();
  }
});

onUnmounted(() => {
  isMounted = false;
});

watch(
  route,
  async () => {
    editModeStore.setEditMode("LESSONS_SELECTION");
  },
  { immediate: true },
);

const headers = computed(() => [
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
]);

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

