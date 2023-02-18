<template>
  <v-container>
    <v-card class="mx-auto" max-width="600" min-height="600">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Answers</v-toolbar-title>
      </v-toolbar>
      <!-- <v-row>
        <v-col>
          <v-select
            v-model="selectedLesson"
            :items="lessons"
            item-value="uuid"
            item-text="name"
            label="lesson:"
            dense
            outlined
          ></v-select>
        </v-col>
        <v-col>
          <v-select
            v-model="selectedQuestion"
            :items="questions"
            item-value="uuid"
            item-text="name"
            label="question:"
            dense
            outlined
          ></v-select>
        </v-col>
      </v-row> -->
      <v-data-table
        :headers="headers"
        :items="answers"
        :item-key="uuid"
        :items-per-page="10"
        class="elevation-1"
        @click:row="selectAnswer"
      ></v-data-table>
    </v-card>
  </v-container>
</template>
<script>
import { mapActions } from "vuex";
import { mapGetters } from "vuex";

export default {
  name: "Answers",
  async mounted() {
    this.load();
  },
  watch: {
    $route: async function () {
      this.load();
    },
  },
  computed: {
    headers: () => [
      {
        text: "Lesson",
        value: "lesson",
      },
      {
        text: "Question",
        value: "question",
      },
      {
        text: "Student",
        value: "student",
      },
      {
        text: "Created At",
        value: "createdAt",
      },
    ],
    lessons() {
      return this.getLessons();
    },
    questions() {
      return this.getQuestions();
    },
    answers() {
      return this.getAnswers().map((a) => {
        return {
          uuid: a.uuid,
          lesson: a.Question.Lesson.name,
          question: a.Question.name,
          student: a.User.firstName + " " + a.User.lastName,
          createdAt: new Date(a.createdAt),
        };
      });
    },
  },
  methods: {
    ...mapActions({
      loadLessons: "loadLessons",
      loadQuestions: "loadQuestions",
      loadAnswers: "loadAnswers",
      setCurrentAnswer: "setCurrentAnswer",
    }),
    ...mapGetters({
      isTeacher: "isTeacher",
      getLessons: "getLessons",
      getQuestions: "getQuestions",
      getAnswers: "getAnswers",
      getCurrentLesson: "getCurrentLesson",
      getCurrentQuestion: "getCurrentQuestion",
    }),
    async load() {
      await this.loadLessons(this.isTeacher());
      await this.loadQuestions();
      await this.loadAnswers();
    },
    async selectAnswer(answer) {
      this.setCurrentAnswer(answer).then(() =>
        this.$router.push({
          path: "/answer/" + answer.uuid,
        })
      );
    },
  },
};
</script>

<style>
.answer_title {
  justify-content: left !important;
}
</style>
