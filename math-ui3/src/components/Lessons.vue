<template>
  <v-container>
    <NewItemDialog
      :dialog="lessonDialog"
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
        :headers="headers"
        :items="lessons"
        :items-per-page="10"
        class="elevation-1"
        @click:row="seletctLesson"
      ></v-data-table>
    </v-card>
  </v-container>
</template>
<script>
import { mapActions } from "vuex";
import { mapGetters } from "vuex";
import NewItemDialog from "./NewItemDialog.vue";

export default {
  components: { NewItemDialog },
  name: "Lessons",
  mounted() {
    this.title = this.isTeacher() ? "My Lessons" : "Lessons Shared with me";
    this.loadLessons(this.isTeacher()).then((lessons) => {
      if (this.isTeacher() && !lessons) {
        this.openLessonDialog();
      }
    });
  },
  methods: {
    ...mapActions({
      loadLessons: "loadLessons",
      addLesson: "addLesson",
      loadLesson: "loadLesson",
      setCurrentLesson: "setCurrentLesson",
    }),
    ...mapGetters({
      getLessons: "getLessons",
      isTeacher: "isTeacher",
    }),
    openLessonDialog() {
      this.lessonDialog = {
        show: true,
        name: "",
        title: "<span>Please specify <strong>lesson</strong> title</span",
      };
    },
    async saveLesson(newLesson) {
      let savedLesson = await this.addLesson(newLesson);
      await this.setCurrentLesson(savedLesson);
      this.$router.push({
        path: "/lesson/" + savedLesson.uuid,
      });
    },
    async seletctLesson(lesson, b) {
      this.loadLesson(lesson.uuid).then(() =>
        this.$router.push({
          path: "/lesson/" + lesson.uuid,
        })
      );
    },
  },
  computed: {
    headers: () => [
      {
        text: "Name",
        value: "name",
      },
      {
        text: "Created At",
        value: "createdAt",
      },
    ],
    lessons: function () {
      return this.getLessons().map((l) => {
        return {
          uuid: l.uuid,
          name: l.name,
          createdAt: new Date(l.createdAt),
        };
      });
    },
  },
  data() {
    return {
      search: "",
      title: "",
      lessonDialog: { show: false, name: "" },
      menu: [
        { icon: "plus", title: "Add" },
        { icon: "remove", title: "Remove" },
      ],
    };
  },
};
</script>

<style>
.lesson_title {
  justify-content: left !important;
}
</style>
