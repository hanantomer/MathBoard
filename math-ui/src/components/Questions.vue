<template>
  <v-container>
    <NewItemDialog
      :dialog="questionDialog"
      v-on="{ save: saveQuestion }"
    ></NewItemDialog>
    <v-card class="mx-auto" max-width="600" min-height="600">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Questions</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon v-on:click="openQuestionDialog">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-toolbar>
      <v-select
        style="margin-top: 10px"
        v-model="selectedLessonId"
        :items="lessons"
        item-value="id"
        item-text="name"
        label="Please choose a lesson:"
        @input="lessonchanged"
        dense
        outlined
      ></v-select>
      <v-list two-line>
        <v-list-item-group active-class="primary--text">
          <v-list-item
            v-for="question in questions"
            :key="question.id"
            @click="seletctQuestion(question)"
          >
            <v-list-item-content class="question_title">
              <v-list-item-title v-text="question.name"> </v-list-item-title>
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
  name: "Questions",
  async mounted() {
    await this.loadLessons();
    if (!this.getCurrentLesson()?.id) return;
    this.selectedLessonId = this.getCurrentLesson().id;

    this.loadQuestions().then((questions) => {
      if (!questions) {
        this.openQuestionDialog();
      }
      this.questions = this.getQuestions();
    });
  },
  computed: {
    lessons() {
      return this.getLessons();
    },
  },
  methods: {
    ...mapActions({
      loadLessons: "loadLessons",
      loadQuestions: "loadQuestions",
      addQuestion: "addQuestion",
      setCurrentLesson: "setCurrentLesson",
      setCurrentQuestion: "setCurrentQuestion",
    }),
    ...mapGetters({
      getLessons: "getLessons",
      getQuestions: "getQuestions",
      getCurrentLesson: "getCurrentLesson",
      getCurrentQuestion: "getCurrentQuestion",
    }),
    async lessonchanged() {
      let selectedLesson = this.getLessons().find(
        (l) => l.uuid === this.selectedLessonId
      );
      await this.setCurrentLesson(selectedLesson);
      await this.loadQuestions();
      this.questions = this.getQuestions();
    },
    openQuestionDialog() {
      this.questionDialog = {
        show: true,
        name: "",
        title: "Please specify question title",
      };
    },
    async saveQuestion(question) {
      let newQuestion = await this.addQuestion(question);
      this.$router.push({
        path: "/question/" + newQuestion.uuid,
      });
    },
    async seletctQuestion(question) {
      this.setCurrentQuestion(question).then(() =>
        this.$router.push({
          path: "/question/" + question.uuid,
        })
      );
    },
  },
  data() {
    return {
      questions: [],
      selectedLessonId: null,
      questionDialog: { show: false, name: "" },
      menu: [
        { icon: "plus", title: "Add" },
        { icon: "remove", title: "Remove" },
      ],
    };
  },
};
</script>

<style>
.question_title {
  justify-content: left !important;
}
</style>
