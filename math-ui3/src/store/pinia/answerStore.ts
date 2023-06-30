import { defineStore } from "pinia";
import Answer from "../../../../math-db/src/models/answer/answer.model";
import Question from "../../../../math-db/src/models/question/question.model";
import  useDbHelper  from "../../Helpers/dbHelper";
import { useQuestionStore } from "./questionStore";
import { useUserStore } from "./userStore";

const questionStore = useQuestionStore();
const userStore = useUserStore();
const db = useDbHelper();

export const useAnswerStore = defineStore("answer", () => {

  let answers: Map<String, Answer> = new Map();
  let currentAnswer: Answer =  new Answer();

  async function loadAnswer(answerUUId: string) {
      const answer: Answer = await db.getAnswer(answerUUId);
      const question: Question = await db.getQuestion(answer.question.id);

      if (answer) {
        this.answers.set(answer.uuid, answer);
        this.currentAnswer = answer;
        questionStore.loadQuestion(question.uuid);
      }
  };

  async function loadAnswers() {
      const answers = await db.getAnswers(
        questionStore.currentQuestion.uuid
      );
      if (answers.length > 0) {
        answers.forEach((a: Answer) => {
          this.answers.set(a.uuid, a);
        });
      }
  };

  async function addNewAnswer(): Promise<Answer> {
      let answerForCurrentQuestion: Answer|null = null;
      this.answers.forEach((a : Answer)  => {
        if (a.question.uuid == questionStore.currentQuestion.uuid) {
          answerForCurrentQuestion = a;
          return;
        }
      });
      if (answerForCurrentQuestion) return answerForCurrentQuestion;

      let answer = <Answer>{};
      answer.question = questionStore.currentQuestion;
      answer.user = userStore.currentUser;
      answer = await db.addAnswer(answer);
      this.answers.set(answer.uuid, answer);
      return answer;
  };

  function setCurrentAnswer(answer: Answer) {
      this.currentAnswer = answer;
  };

  function removeAnswer(answer: Answer) {
      this.answers.delete(answer.uuid);
  };

  return {answers, currentAnswer, loadAnswer, loadAnswers, addNewAnswer, setCurrentAnswer, removeAnswer}
});
