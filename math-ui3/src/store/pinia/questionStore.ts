//  questions of current lesson
import { defineStore } from "pinia";
import {
  QuestionAttributes,
  QuestionCreationAttributes,
} from "common/questionTypes";
import useDbHelper from "../../helpers/dbHelper";
import { useLessonStore } from "./lessonStore";
import { useUserStore } from "./userStore";
import { ref } from "vue";

const lessonStore = useLessonStore();
const userStore = useUserStore();
const db = useDbHelper();

///TODO: create convention for all crud operation for all stores

export const useQuestionStore = defineStore("answer", () => {
  let questions = ref<Map<String, QuestionAttributes>>(new Map());
  let currentQuestion = ref<QuestionAttributes>();

  function getQuestions() {
    return questions.value;
  }

  function getCurrentQuestion() {
    return currentQuestion.value;
  }

  async function loadQuestion(questionUUId: string) {
    let questionFromDb = await db.getQuestion(questionUUId);

    if (!questionFromDb) return;

    questions.value.set(questionUUId, questionFromDb);

    setCurrentQuestion(questionFromDb);
  }

  async function loadQuestions() {
    if (!lessonStore.getCurrentLesson()) return;

    if (!lessonStore.getLessons()) {
      lessonStore.loadLessons();
    }

    let questionsFromDb = await db.getQuestions(
      lessonStore.getCurrentLesson()!.uuid,
    );
    questionsFromDb.forEach((q: QuestionAttributes) => {
      questions.value.set(q.uuid, q);
    });
  }

  async function addQuestion(questionName: string) {
    let question: QuestionCreationAttributes = {
      name: questionName,
      user: userStore.getCurrentUser()!,
      lesson: lessonStore.getCurrentLesson()!,
    };

    let createdQuestion = await db.addQuestion(question);
    questions.value.set(createdQuestion.uuid, createdQuestion);
    setCurrentQuestion(createdQuestion);
    return question;
  }

  async function setCurrentQuestion(question: QuestionAttributes) {
    currentQuestion.value = question;
    lessonStore.setCurrentLesson(currentQuestion.value.lesson.uuid);
  }

  function removeQuestion(question: QuestionAttributes) {
    questions.value.delete(question.uuid);
  }

  return {
    getQuestions,
    getCurrentQuestion,
    loadQuestions,
    loadQuestion,
    addQuestion,
    setCurrentQuestion,
    removeQuestion,
  };
});
