//  questions of current lesson
import { defineStore } from "pinia";
import Question from "../../../../math-db/src/models/question/question.model";
import dbSync from "../../Mixins/dbSyncMixin";
import { useLessonStore } from "./lessonStore"


const lessonStore = useLessonStore();
const db = dbSync();

/*
const helper = {
  findQuestionById: function (state, id) {
    return state.questions.find((q) => q.id == id);
  },
};
*/

export const useQuestionStore = defineStore("answer", {
  state: () => ({
    questions: <Question[]>[],
    currentQuestion: <Question>{},
  }),

  getters: {
    getQuestions: function (): Question[] {
      return this.questions;
    },
    getCurrentQuestion: function (): Question {
      return this.currentQuestion;
    },
  },
  actions: {
    async loadQuestion(questionUUId: string) {
      let question = await db.getQuestion(questionUUId);
      if (question) {
        this.currentQuestion = question;
      }
    },
    async loadAllQuestions() {
      this.questions = [];
      let questions = await db.getQuestions(this.currentQuestion.uuid);
      if (questions.data.length > 0) {
        questions.data.forEach((e: any) => {
          this.questions.push(e);
        });
      }
    },
    async addQuestion(question: Question) {
      // handle lesson
      question.lessonUUId = lessonStore.getCurrentLesson.uuid;
      question = await dbSyncMixin.methods.addQuestion(question);
      context.commit("addQuestion", question.data);
      return question.data;
    },
    setCurrentQuestion(context, question) {
      context.commit("setCurrentQuestion", question);
    },
    removeQuestion(context, question) {
      context.commit("removeQuestion", question.uuid);
    },
  },
});
