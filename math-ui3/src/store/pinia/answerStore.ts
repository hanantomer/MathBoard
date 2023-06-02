import { defineStore } from "pinia";
import Answer from "../../../../math-db/src/models/answer/answer.model";
import Question from "../../../../math-db/src/models/question/question.model";
import { dbSync } from "../../Mixins/dbSyncMixin";
import { useQuestionStore } from "./questionStore";
import { useUserStore } from "./userStore";

const questionStore = useQuestionStore();
const userStore = useUserStore();
const db = dbSync();

export const useAnswerStore = defineStore("answer", {
  state: () => ({
    answers: <Map<String, Answer>>{},
    currentAnswer: <Answer>{},
  }),

  getters: {
    getAnswers: function (): Map<String, Answer> {
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
        this.answers.set(answer.uuid, answer);
        this.currentAnswer = answer;
        questionStore.loadQuestion(question.uuid);
      }
    },

    async loadAnswers() {
      const answers = await db.getAnswers(
        questionStore.getCurrentQuestion.uuid
      );
      if (answers.length > 0) {
        answers.forEach((a: Answer) => {
          this.answers.set(a.uuid, a);
        });
      }
    },

    async addNewAnswer(): Promise<Answer> {
      let answerForCurrentQuestion: Answer|null = null;
      this.getAnswers.forEach(a => {
        if (a.question.uuid == questionStore.getCurrentQuestion.uuid) {
          answerForCurrentQuestion = a;
          return;
        }
      });
      if (answerForCurrentQuestion) return answerForCurrentQuestion;

      let answer = <Answer>{};
      answer.question = questionStore.getCurrentQuestion;
      answer.user = userStore.getCurrentUser;
      answer = await db.addAnswer(answer);
      this.answers.set(answer.uuid, answer);
      return answer;
    },

    setCurrentAnswer(answer: Answer) {
      this.currentAnswer = answer;
    },

    removeAnswer(answer: Answer) {
      this.answers.delete(answer.uuid);
    },
  },
});
