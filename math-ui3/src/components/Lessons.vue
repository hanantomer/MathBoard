<template>
  <v-container>
    <NewItemDialog
      :dialog="lessonDialog"
      :title="lessonDialogTitle"
    ></NewItemDialog>
    <v-card class="mx-auto mt-4" max-width="800" min-height="600">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon v-on:click="openLessonDialog" v-show="userStore.isTeacher()">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
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
      ></v-data-table>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
import NewItemDialog from "./NewItemDialog.vue";
import { formatDate } from "../../../math-common/src/globals";
import { LessonAttributes } from "../../../math-common/src/lessonTypes";
import { useUserStore } from "../store/pinia/userStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import useEventBus from "../helpers/eventBusHelper";
const eventBus = useEventBus();
const router = useRouter();
const userStore = useUserStore();
const lessonStore = useLessonStore();
const title = computed(() => {
  return userStore.isTeacher() ? "Lessons" : "Lessons Shared with me";
});
let lessonDialog = ref(false);
let lessonDialogTitle =
  "<span>Please specify <strong>lesson</strong> title</span";
let search = ref("");
const menu = [
  { icon: "plus", title: "Add" },
  //{ icon: "remove", title: "Remove" },
];
let itemsPerPage = 10;

onMounted(() => lessonStore.loadLessons());

watch(
  () => eventBus.bus.value.get("newItemSave"),
  (val: string) => {
    addLesson(val);
  },
);

const headers = computed(() => [
  {
    title: "Name",
    key: "name",
    sortable: false,
  },
  {
    title: "Created At",
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

async function loadLessons() {
  await lessonStore.loadLessons();
  if (userStore.isTeacher() && lessonStore.getLessons().size === 0) {
    openLessonDialog();
  }
}

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
