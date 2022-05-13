<template>
  <v-container>
    <LessonDialog
      :dialog="lessonDialog"
      v-on="{ save: saveLesson }"
    ></LessonDialog>
    <v-card class="mx-auto" max-width="500">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>My Lessons</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon v-on:click="openLessonDialog">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-toolbar>

      <v-list two-line>
        <v-list-item-group active-class="primary--text">
          <v-list-item
            v-for="item in items"
            :key="item.id"
            @click="lessonSeletcted(item)"
          >
            <v-list-item-content class="lesson_title">
              <v-list-item-title v-text="item.name"> </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-card>
  </v-container>
</template>
<script>
import { mapActions } from "vuex";
import { mapGetters } from "vuex";
import LessonDialog from "./LessonDialog.vue";
import LessonStudents from "./LessonStudents.vue";

export default {
  components: { LessonDialog, LessonStudents },
  name: "Lessons",
  mounted() {
    this.loadLessons().then((lessons) => {
      if (!lessons) {
        this.openLessonDialog();
      }
    });
  },
  computed: {
    items() {
      return this.getLessons();
    },
  },
  methods: {
    ...mapActions({
      loadLessons: "loadLessons",
      addLesson: "addLesson",
      setCurrentLesson: "setCurrentLesson",
    }),
    ...mapGetters({
      getLessons: "getLessons",
    }),
    openLessonDialog() {
      this.lessonDialog = { show: true, name: "" };
    },
    saveLesson(lesson) {
      this.addLesson(lesson).then((addedLesson) => {
        this.$router.push({
          path: "/symbols/" + addedLesson.id,
        });
      });
    },
    async lessonSeletcted(lesson) {
      this.setCurrentLesson(lesson).then(() =>
        this.$router.push({
          path: "/symbols/" + lesson.id,
        })
      );
    },
  },
  data() {
    return {
      selectedItem: {},
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
