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

export const useQuestionStore = defineStore("question", () => {
  let questions = ref<Map<String, QuestionAttributes>>(new Map());
  let currentQuestion = ref<QuestionAttributes>();

  function getQuestions() {
    return questions.value;
  }

  function getCurrentQuestion() {
    return currentQuestion.value;
  }

  async function loadQuestion(questionUUId: string) : Promise<QuestionAttributes | null> {
    let question = await db.getQuestion(questionUUId);

    if (!question) return null;

    questions.value.set(questionUUId, question);

    return question;
  }

  async function loadQuestions() {
    //if (!lessonStore.getCurrentLesson()) return;

    if (!lessonStore.getLessons().size) {
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
    setCurrentQuestion(createdQuestion.uuid);
    return question;
  }

  async function setCurrentQuestion(questionUUId: string) {
    currentQuestion.value = questions.value.get(questionUUId);
    //lessonStore.setCurrentLesson(currentQuestion.value.lesson.uuid);
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
