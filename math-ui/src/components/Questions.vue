<template>
  <v-container>
    <NewItemDialog
      :dialog="questionDialog"
      v-on="{ save: saveQuestion }"
    ></NewItemDialog>
    <v-card class="mx-auto" max-width="500">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Lesson Questions</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon v-on:click="openQuestionDialog">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-combobox
          v-model="select"
          :items="lessons"
          label="Choose a lesson"
          outlined
          dense
        ></v-combobox>
      </v-toolbar>

      <v-list two-line>
        <v-list-item-group active-class="primary--text">
          <v-list-item
            v-for="item in items"
            :key="item.id"
            @click="seletctQuestion(item)"
          >
            <v-list-item-content class="question_title">
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
import NewItemDialog from "./NewItemDialog.vue";

export default {
  components: { NewItemDialog },
  name: "Questions",
  mounted() {
    this.loadQuestions().then((questions) => {
      if (!questions) {
        this.openQuestionDialog();
      }
    });
  },
  computed: {
    lessons() {
      return this.getQuestions();
    },
    lessons() {
      return this.getLessons();
    },
  },
  methods: {
    ...mapActions({
      loadLessons: "loadLessons",
      loadQuestions: "loadQuestions",
      addQuestion: "addQuestion",
      setCurrentLesson: "setCurrentQuestion",
      setCurrenQuestion: "setCurrenQuestion",
    }),
    ...mapGetters({
      getLessons: "getLessons",
      getQuestions: "getQuestions",
      getCurrentQuestion: "getCurrentQuestion",
    }),
    openLessonDialog() {
      this.questionDialog = {
        show: true,
        name: "",
        title: "Please specify question title",
      };
    },
    async saveQuestion(question) {
      let newQuestion = await this.addQuestion(question);
      this.$router.push({
        path: "/question/" + newQuestion.id,
      });
    },
    async seletctQuestion(question) {
      this.setCurrentQuestion(question).then(() =>
        this.$router.push({
          path: "/question/" + question.id,
        })
      );
    },
  },
  data() {
    return {
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
