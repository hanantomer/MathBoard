import { defineStore } from "pinia";
import { AnswerAttributes } from "common/answerTypes";
import { useQuestionStore } from "./questionStore";
import { useUserStore } from "./userStore";

import useDbHelper from "../../helpers/dbHelper";
const questionStore = useQuestionStore();
const userStore = useUserStore();
const db = useDbHelper();

export const useAnswerStore = defineStore("answer", () => {

  let answers: Map<String, AnswerAttributes> = new Map();
  let currentAnswer = <AnswerAttributes>{};

  function getAnswers() {
    return answers;
  }

  function getCurrentAnswer() {
    return currentAnswer;
  }

  async function loadAnswer(answerUUId: string) {
    const answer = await db.getAnswer(answerUUId);
    const question = await db.getQuestion(answer.question.uuid);

    if (answer) {
      answers.set(answer.uuid, answer);
      currentAnswer = answer;
      questionStore.setCurrentQuestion(answer.question);
    }
  };

  async function loadAnswers() {
    if (!questionStore.getQuestions()) {
      questionStore.loadQuestions();
    }

    const answersFromDb = await db.getAnswers(questionStore.getCurrentQuestion()!.uuid );
    answersFromDb.forEach((a: AnswerAttributes) => {
      answers.set(a.uuid, a);
    });
  };

  // answer is initially empty
  async function addAnswer() {
    let answerForCurrentQuestion: AnswerAttributes|null = null;
    answers.forEach((a : AnswerAttributes)  => {
      if (a.question.uuid == questionStore.getCurrentQuestion()!.uuid) {
        answerForCurrentQuestion = a;
        return;
      }
    });
    if (answerForCurrentQuestion) return;

    let answer = <AnswerAttributes>{};
    answer.question  = questionStore.getCurrentQuestion()!;
    answer.user = userStore.getCurrentUser()!;
    answer = await db.addAnswer(answer);
    answers.set(answer.uuid, answer);
    setCurrentAnswer(answer)
  };

  function setCurrentAnswer(answer: AnswerAttributes) {
    currentAnswer = answer;
  };

  function removeAnswer(answer: AnswerAttributes) {
    answers.delete(answer.uuid);
  };

  return {getAnswers, getCurrentAnswer, loadAnswer, loadAnswers, addAnswer, setCurrentAnswer, removeAnswer}
});
