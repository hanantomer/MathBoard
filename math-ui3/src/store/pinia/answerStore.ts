import { defineStore } from "pinia";
import Answer from "../../../../math-db/src/models/answer/answer.model";
import Question from "../../../../math-db/src/models/question/question.model";
import  useDbHelper  from "../../helpers/dbHelper";
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
        answers.set(answer.uuid, answer);
        currentAnswer = answer;
        questionStore.loadQuestion(question.uuid);
      }
  };

  async function loadAnswers() {
    if (!questionStore.questions.size) {
      questionStore.loadQuestions();
    }

    const answersFromDb = await db.getAnswers(questionStore.currentQuestion.uuid );
    answersFromDb.forEach((a: Answer) => {
      answers.set(a.uuid, a);
    });
  };

  async function addAnswer() {
      let answerForCurrentQuestion: Answer|null = null;
      answers.forEach((a : Answer)  => {
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
      answers.set(answer.uuid, answer);
      setCurrentAnswer(answer)
  };

  function setCurrentAnswer(answer: Answer) {
    currentAnswer = answer;
  };

  function removeAnswer(answer: Answer) {
    answers.delete(answer.uuid);
  };

  return {answers, currentAnswer, loadAnswer, loadAnswers, addAnswer, setCurrentAnswer, removeAnswer}
});
