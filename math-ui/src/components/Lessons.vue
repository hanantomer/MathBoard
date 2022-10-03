<template>
  <v-container>
    <NewItemDialog
      :dialog="lessonDialog"
      v-on="{ save: saveLesson }"
    ></NewItemDialog>
    <v-card class="mx-auto" max-width="600" min-height="600">
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
            v-for="lesson in lessons"
            :key="lesson.id"
            @click="seletctLesson(lesson)"
          >
            <v-list-item-content class="lesson_title">
              <v-list-item-title v-text="lesson.name"> </v-list-item-title>
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
import NewItemDialog from "./NewItemDialog.vue";

export default {
  components: { NewItemDialog },
  name: "Lessons",
  mounted() {
    this.loadLessons().then((lessons) => {
      if (!lessons) {
        this.openLessonDialog();
      }
      this.lessons = this.getLessons();
    });
  },
  computed: {
    // lessons() {
    //   console.debug(this.getLessons().length);
    //   return this.getLessons();
    // },
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
      this.lessonDialog = {
        show: true,
        name: "",
        title: "Please specify lesson title",
      };
    },
    async saveLesson(lesson) {
      let newLesson = await this.addLesson(lesson);
      this.$router.push({
        path: "/lesson/" + newLesson.id,
      });
    },
    async seletctLesson(lesson) {
      this.setCurrentLesson(lesson).then(() =>
        this.$router.push({
          path: "/lesson/" + lesson.id,
        })
      );
    },
  },
  data() {
    return {
      lessons: [],
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
