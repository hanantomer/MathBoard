import { defineStore } from "pinia";
import Answer from "../../../../math-db/src/models/answer/answer.model";
import Question from "../../../../math-db/src/models/question/question.model";
import dbSync from "../../Mixins/dbSyncMixin";
import { useQuestionStore } from "./questionStore";
import { useUserStore } from "./userStore";

const questionStore = useQuestionStore();
const userStore = useUserStore();
const db = dbSync();

export const answerStore = defineStore("answer", {
  state: () => ({
    answers: <Answer[]>[],
    currentAnswer: <Answer>{},
  }),

  getters: {
    getAnswers: function (): Answer[] {
      return this.answers;
    },

    getCurrentAnswer: function (): Answer {
      return this.currentAnswer;
    },
  },

  actions: {
    async loadAnswer(answerUUId: string) {
      const answer: Answer = await db.getAnswer(answerUUId);
      const question: Question = await db.getQuestion(answer.question.id);

      if (answer) {
        this.answers.push(answer);
        this.currentAnswer = answer;
        questionStore.loadQuestion(question.uuid);
      }
    },

    async loadAnswers() {
      this.answers = [];
      const answers: Answer[] = await db.getAnswers(
        questionStore.getCurrentQuestion.uuid
      );
      if (answers.length > 0) {
        answers.forEach((a: any) => {
          this.answers.push(a);
        });
      }
    },

    async addNewAnswer() {
      let answer = this.getAnswers.find(
        (a) => a.question.uuid == questionStore.getCurrentQuestion.uuid
      );
      if (answer) return answer;

      answer = <Answer>{};
      answer.question = questionStore.getCurrentQuestion;
      answer.user = userStore.getCurrentUser;
      answer = await db.addAnswer(answer);
      this.answers.push(answer);
      return answer.data;
    },


    setCurrentAnswer(context, answer) {
      context.commit("setCurrentAnswer", answer);
    },
    removeAnswer(context, answer) {
      context.commit("removeAnswer", answer.id);
    },
  },
});
