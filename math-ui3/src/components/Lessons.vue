<template>
  <v-container>
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
        @click:row="selectLesson"
        :hide-no-data="true"
        :hover="true"
        height="400"
        density="compact"
        fixed-header
      ></v-data-table>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
import NewBoardItemDialog from "./NewBoardItemDialog.vue";
import { formatDate } from "../../../math-common/src/globals";
import { LessonAttributes } from "../../../math-common/src/lessonTypes";
import { useUserStore } from "../store/pinia/userStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { watch, ref, computed, onMounted } from "vue";
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

onMounted(async () => {
  await lessonStore.loadLessons();

  if (lessonStore.getLessons().size === 0 && userStore.isTeacher()) {
    openLessonDialog();
    return;
  }
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
  lessonDialog.value = false;
  let savedLesson = await lessonStore.addLesson(lessonName);
  router.push({
    path: "/lesson/" + savedLesson.uuid,
  });
}

async function selectLesson(e: any, row: any) {
  e.stopPropagation();
  router.push({
    path: "/lesson/" + row.item.uuid,
  });
}
</script>

<style>
.lesson_title {
  justify-content: left !important;
}
</style>
