//  questions of current lesson
import { defineStore } from "pinia";
import {
  QuestionAttributes,
  QuestionCreationAttributes,
} from "common/questionTypes";
import useDbHelper from "../../helpers/dbHelper";
import { useLessonStore } from "./lessonStore";
import { useUserStore } from "./userStore";

const lessonStore = useLessonStore();
const userStore = useUserStore();
const db = useDbHelper();

///TODO: create convention for all crud operation for all stores

export const useQuestionStore = defineStore("answer", () => {
  let questions: Map<String, QuestionAttributes> = new Map();
  let currentQuestion = <QuestionAttributes>{};

  function getQuestions() {
    return questions;
  }

  function getCurrentQuestion() {
    return currentQuestion;
  }

  async function loadQuestion(questionUUId: string) {
    currentQuestion = await db.getQuestion(questionUUId);
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
      questions.set(q.uuid, q);
    });
  }

  async function addQuestion(questionName: string) {

    let question: QuestionCreationAttributes = {
      name: questionName,
      user: userStore.getCurrentUser()!,
      lesson: lessonStore.getCurrentLesson()!
    };

    let createdQuestion = await db.addQuestion(question);
    questions.set(createdQuestion.uuid, createdQuestion);
    setCurrentQuestion(createdQuestion.uuid);
    return question;
  }

  function setCurrentQuestion(questionUUId: string) {
    if (!questions.get(questionUUId)) {
      loadQuestions();
    }
    if (questions.get(questionUUId)) {
      currentQuestion = questions.get(questionUUId)!;
    }
  }

  function removeQuestion(question: QuestionAttributes) {
    questions.delete(question.uuid);
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
