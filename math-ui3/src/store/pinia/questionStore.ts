//  questions of current lesson
import { defineStore } from "pinia";
import {
  QuestionAttributes,
  QuestionCreationAttributes,
} from "common/questionTypes";
import useApiHelper from "../../helpers/apiHelper";
import { useLessonStore } from "./lessonStore";
import { useUserStore } from "./userStore";
import { ref } from "vue";

///TODO: create convention for all crud operation for all stores

export const useQuestionStore = defineStore("question", () => {
  let questions = ref<Map<String, QuestionAttributes>>(new Map());
  let currentQuestion = ref<QuestionAttributes>();

  function getQuestions() {
    return questions.value;
  }

  function getCurrentQuestion() {
    return currentQuestion.value;
  }

  async function loadQuestion(
    questionUUId: string,
  ): Promise<QuestionAttributes | null> {
    const db = useApiHelper();
    let question = await db.getQuestion(questionUUId);

    if (!question) return null;

    questions.value.set(questionUUId, question);

    return question;
  }

  function clearQuestionsForLesson(lessonUUId: string) {
    questions.value.forEach((q, uuid) => {
      if (q.lesson?.uuid === lessonUUId) {
        questions.value.delete(uuid);
      }
    });
  }

  async function loadQuestions() {
    const lessonStore = useLessonStore();
    const db = useApiHelper();

    if (!lessonStore.getLessons().size) {
      await lessonStore.loadLessons();
    }

    const lessonUUId = lessonStore.getCurrentLesson()!.uuid;
    clearQuestionsForLesson(lessonUUId);

    const questionsFromDb = await db.getQuestions(lessonUUId);
    questionsFromDb.forEach((q: QuestionAttributes) => {
      questions.value.set(q.uuid, q);
    });
  }

  async function reloadQuestions() {
    await loadQuestions();
  }

  async function addQuestion(questionName: string) {
    const userStore = useUserStore();
    const lessonStore = useLessonStore();
    const db = useApiHelper();

    let question: QuestionCreationAttributes = {
      name: questionName,
      user: userStore.getCurrentUser()!,
      lesson: lessonStore.getCurrentLesson()!,
    };

    let createdQuestion = await db.addQuestion(question);
    questions.value.set(createdQuestion.uuid, createdQuestion);
    setCurrentQuestion(createdQuestion.uuid);
    return question;
  }

  async function setCurrentQuestion(questionUUId: string) {
    currentQuestion.value = questions.value.get(questionUUId);
    //lessonStore.setCurrentLesson(currentQuestion.value.lesson.uuid);
  }

  function removeQuestion(questionUUId: string) {
    questions.value.delete(questionUUId);
    if (currentQuestion.value?.uuid === questionUUId) {
      currentQuestion.value = undefined;
    }
  }

  function removeQuestionsForLesson(lessonUUId: string): string[] {
    const removed: string[] = [];
    questions.value.forEach((q, uuid) => {
      if (q.lesson?.uuid === lessonUUId) {
        removed.push(String(uuid));
      }
    });
    removed.forEach((uuid) => removeQuestion(uuid));
    return removed;
  }

  async function updateQuestion(
    questionUUId: string,
    questionName: string,
  ): Promise<QuestionAttributes> {
    const db = useApiHelper();
    const updated = await db.updateQuestion(questionUUId, questionName);
    questions.value.set(updated.uuid, updated);
    if (currentQuestion.value?.uuid === questionUUId) {
      currentQuestion.value = updated;
    }
    return updated;
  }

  async function deleteQuestion(questionUUId: string): Promise<void> {
    const db = useApiHelper();
    await db.deleteQuestion(questionUUId);
    removeQuestion(questionUUId);
  }

  return {
    getQuestions,
    getCurrentQuestion,
    loadQuestions,
    reloadQuestions,
    loadQuestion,
    addQuestion,
    setCurrentQuestion,
    removeQuestion,
    removeQuestionsForLesson,
    updateQuestion,
    deleteQuestion,
  };
});
