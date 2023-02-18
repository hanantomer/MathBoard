<template>
  <v-container>
    <v-dialog v-model="noLessonDialog" max-width="290">
      <v-card>
        <v-card-title class="text-h5">Attention </v-card-title>

        <v-card-text>
          Please create lesson for which you can add a question
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="green darken-1" text @click="navToLessons"> OK </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <NewQuestionDialog
      :dialog="questionDialog"
      v-on="{ save: saveQuestion }"
    ></NewQuestionDialog>
    <v-card class="mx-auto" max-width="800" min-height="600">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Questions</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon v-on:click="openQuestionDialog">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="questions"
        :item-key="uuid"
        :items-per-page="10"
        class="elevation-1"
        @click:row="seletctQuestion"
      ></v-data-table>
    </v-card>
  </v-container>
</template>
<script>
import { mapActions } from "vuex";
import { mapGetters } from "vuex";
import NewQuestionDialog from "./NewQuestionDialog.vue";

export default {
  mounted: function () {
    this.load();
  },
  components: { NewQuestionDialog },
  name: "Questions",
  watch: {
    $route: "load",
  },
  computed: {
    headers: () => [
      {
        text: "Lesson Name",
        value: "lessonName",
      },
      {
        text: "Question Name",
        value: "name",
      },
      {
        text: "Created At",
        value: "createdAt",
      },
    ],
    questions: function () {
      return this.getQuestions().map((q) => {
        return {
          uuid: q.uuid,
          name: q.name,
          lessonName: q.Lesson.name,
          createdAt: new Date(q.createdAt),
        };
      });
    },
  },
  methods: {
    ...mapActions({
      loadLessons: "loadLessons",
      loadQuestions: "loadQuestions",
      addQuestion: "addQuestion",
      setCurrentQuestion: "setCurrentQuestion",
      setCurrentAnswer: "setCurrentAnswer",
      isTeacher: "isTeacher",
    }),
    ...mapGetters({
      isTeacher: "isTeacher",
      getQuestions: "getQuestions",
    }),
    ...mapActions({
      addAnswer: "addAnswer",
    }),

    navToLessons() {
      this.noLessonDialog = false;
      this.$router.push({
        path: "/lessons/",
      });
    },

    async load() {
      let lessonCount = await this.loadLessons(this.isTeacher());
      if (!lessonCount) {
        this.noLessonDialog = true;
        return;
      }
      this.loadQuestions().then((questions) => {
        if (!questions) {
          this.openQuestionDialog();
        }
      });
    },

    openQuestionDialog() {
      this.questionDialog = {
        show: true,
        name: "",
        title: "<span>Please specify <strong>question</strong> title</span",
      };
    },

    async saveQuestion(question) {
      let newQuestion = await this.addQuestion(question);
      this.$router.push({
        path: "/question/" + newQuestion.uuid,
      });
    },

    async seletctQuestion(question) {
      if (this.isTeacher()) {
        this.setCurrentQuestion(question).then(() =>
          this.$router.push({
            path: "/question/" + question.uuid,
          })
        );
      } else {
        await this.setCurrentQuestion(question);
        // add student answer when question is first selected
        let answer = await this.addAnswer();
        this.setCurrentAnswer(answer).then(() =>
          this.$router.push({
            path: "/answer/" + answer.uuid,
          })
        );
      }
    },
  },
  data() {
    return {
      noLessonDialog: false,
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
