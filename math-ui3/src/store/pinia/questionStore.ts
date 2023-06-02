//  questions of current lesson
import { defineStore } from "pinia";
import Question from "../../../../math-db/src/models/question/question.model";
import {dbSync}  from "../../Mixins/dbSyncMixin";
import { useLessonStore } from "./lessonStore";
import QuestionSqrt from "../../../../math-db/src/models/question/line/questionSqrt.model";

const lessonStore = useLessonStore();
const db = dbSync();

export const useQuestionStore = defineStore("answer", {
  state: () => ({
    questions: <Map<String, Question>>{},
    currentQuestion: <Question>{},
  }),

  getters: {
    getQuestions: function (): Map<String, Question> {
      return this.questions;
    },

    getCurrentQuestion: function (): Question {
      return this.currentQuestion;
    },
  },
  actions: {

    async loadQuestion(questionUUId: string) {
      this.currentQuestion = await db.getQuestion(questionUUId);
    },

    async loadAllQuestions() {
      this.questions = <Map<String, Question>>{};

      let questions = await db.getQuestions(lessonStore.getCurrentLesson.uuid);
      questions.forEach((q: Question) => {
        this.questions.set(q.uuid, q);
      });
    },

    async addQuestion(question: Question) {
      question.lessonUUID = lessonStore.getCurrentLesson.uuid;
      question = await db.addQuestion(question);
      this.questions.set(question.uuid, question);
      return question;
    },

    setCurrentQuestion(question: Question) {
      this.currentQuestion = question;
    },

    removeQuestion(question: Question) {
      this.questions.delete(question.uuid);
    },
  },
});
