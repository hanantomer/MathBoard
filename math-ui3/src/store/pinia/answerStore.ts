import { defineStore } from "pinia";
import { AnswerAttributes } from "common/answerTypes";
import { useQuestionStore } from "./questionStore";
import { useUserStore } from "./userStore";
import { ref } from "vue";

import useApiHelper from "../../helpers/apiHelper";

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
    const db = useApiHelper();
    const answer = await db.getAnswer(answerUUId);

    if (!answer) return null;

    answers.value.set(answerUUId, answer);

    return answer;
  }

  async function loadAnswers() {
    const db = useApiHelper();
    const questionStore = useQuestionStore();
    const answersFromDb = await db.getAnswers(
      questionStore.getCurrentQuestion()!.uuid,
    );
    answersFromDb.forEach((a: AnswerAttributes) => {
      answers.value.set(a.uuid, a);
    });
  }

  async function addAnswer(questionUUId: string) {
    const db = useApiHelper();
    const questionStore = useQuestionStore();
    const userStore = useUserStore();
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

  function removeAnswer(answerUUId: string) {
    answers.value.delete(answerUUId);
    if (currentAnswer.value?.uuid === answerUUId) {
      currentAnswer.value = undefined;
    }
  }

  function removeAnswersForQuestion(questionUUId: string) {
    const removed: string[] = [];
    answers.value.forEach((a, uuid) => {
      if (a.question?.uuid === questionUUId) {
        removed.push(String(uuid));
      }
    });
    removed.forEach((uuid) => removeAnswer(uuid));
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
    removeAnswersForQuestion,
    getQuestionAnswer,
  };
});
