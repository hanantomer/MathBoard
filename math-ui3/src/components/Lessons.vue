<template>
  <v-container>
    <NewItemDialog
      :dialog = "lessonDialog"
      :title = "lessonDialogTitle"
      v-on="{ save: saveLesson }"
    ></NewItemDialog>
    <v-card class="mx-auto" max-width="800" min-height="600">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon v-on:click="openLessonDialog">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-title>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :search="search"
        :v-bind:headers="headers"
        :items="lessons"
        :items-per-page="10"
        class="elevation-1"
        click:row="seletctLesson"
      ></v-data-table>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
import NewItemDialog from "./NewItemDialog.vue";
import { LessonAttributes } from "../../../math-common/build/notationTypes";
import { computed, ref } from "vue"
import { useUserStore } from "../store/pinia/userStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const userStore = useUserStore();
const lessonStore = useLessonStore();
const title = computed(() => { return userStore.isTeacher() ? "My Lessons" : "Lessons Shared with me" })
let lessonDialog = false;
let lessonDialogTitle = "<span>Please specify <strong>lesson</strong> title</span";
let search = ref("");
const menu = [
  { icon: "plus", title: "Add" },
  { icon: "remove", title: "Remove" },
];


watch(route, (to) => {
  lessonStore.loadLessons();
  if (userStore.isTeacher()  && !lessonStore.lessons) {
    openLessonDialog();
  }
}, { flush: 'pre', immediate: true, deep: true });

function openLessonDialog() {
  lessonDialog = true;
};

async function saveLesson(newLesson: LessonAttributes) {
      lessonDialog = false;
      let savedLesson =  await lessonStore.addLesson(newLesson);
      router.push({
        path: "/lesson/" + savedLesson.uuid,
      });
};

async function seletctLesson(lesson: LessonAttributes) {
  router.push({
    path: "/lesson/" + lesson.uuid,
  });
};

const headers = computed(() => [
  {
    text: "Name",
    value: "name",
  },
  {
    text: "Created At",
    value: "createdAt",
  },
]);

const lessons = computed(() => {
  return Object.entries(lessonStore.lessons).map((l: LessonAttributes[]) => l[1]).map((l: LessonAttributes) => {
    return { uuid: l.uuid, name: l.name, createdAt: l.createdAt }
  })
});

</script>

<style>
.lesson_title {
  justify-content: left !important;
}
</style>
