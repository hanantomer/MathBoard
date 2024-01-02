import { defineStore } from "pinia";
import { AnswerAttributes } from "common/answerTypes";
import { useQuestionStore } from "./questionStore";
import { useUserStore } from "./userStore";
import { ref } from "vue";

import useDbHelper from "../../helpers/dbHelper";
const questionStore = useQuestionStore();
const userStore = useUserStore();
const db = useDbHelper();

export const useAnswerStore = defineStore("answer", () => {
  let answers = ref<Map<String, AnswerAttributes>>(new Map());
  let currentAnswer = ref<AnswerAttributes>();

  function getAnswers() {
    return answers.value;
  }

  function getCurrentAnswer() {
    return currentAnswer.value;
  }

  async function loadAnswer(
    answerUUId: string,
  ): Promise<AnswerAttributes | null> {
    const answer = await db.getAnswer(answerUUId);

    if (!answer) return null;

    answers.value.set(answerUUId, answer);

    return answer;
  }

  async function loadAnswers() {
    const answersFromDb = await db.getAnswers(
      questionStore.getCurrentQuestion()!.uuid,
    );
    answersFromDb.forEach((a: AnswerAttributes) => {
      answers.value.set(a.uuid, a);
    });
  }

  async function addAnswer(questionUUId: string) {
    // add new answer
    let answer = <AnswerAttributes>{};
    answer.question = questionStore.getQuestions().get(questionUUId)!;
    answer.user = userStore.getCurrentUser()!;
    answer = await db.addAnswer(answer);
    answers.value.set(answer.uuid, answer);
    setCurrentAnswer(answer.uuid);
  }

  function setCurrentAnswer(answerUUId: string) {
    currentAnswer.value = answers.value.get(answerUUId);
  }

  function removeAnswer(answer: AnswerAttributes) {
    answers.value.delete(answer.uuid);
  }

  function getQuestionAnswer(questionUUId: string) {
    return Array.from(answers.value.values()).find(
      (a) => a.question?.uuid === questionUUId,
    );
  }


  return {
    getAnswers,
    getCurrentAnswer,
    loadAnswer,
    loadAnswers,
    addAnswer,
    setCurrentAnswer,
    removeAnswer,
    getQuestionAnswer,
  };
});
