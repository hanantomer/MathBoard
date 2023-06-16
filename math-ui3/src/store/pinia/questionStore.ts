//  questions of current lesson
import { defineStore } from "pinia";
import Question from "../../../../math-db/src/models/question/question.model";
import {dbSync}  from "../../Helpers/dbSyncMixin";
import { useLessonStore } from "./lessonStore";

const lessonStore = useLessonStore();
const db = dbSync();

///TODO: create convention for all crud operation for all stores


export const useQuestionStore = defineStore("answer", ()=> {

  let questions: Map<String, Question> = new Map();
  let currentQuestion: Question = new Question();

  async function loadQuestion(questionUUId: string) {
      currentQuestion = await db.getQuestion(questionUUId);
  };

  async function loadAllQuestions() {
    let questions = await db.getQuestions(lessonStore.currentLesson.uuid);
    questions.forEach((q: Question) => {
      this.questions.set(q.uuid, q);
    });
  };

  async function addQuestion(question: Question) {
    question.lessonUUID = lessonStore.currentLesson.uuid;
    question = await db.addQuestion(question);
    this.questions.set(question.uuid, question);
    return question;
  };

  function setCurrentQuestion(question: Question) {
      currentQuestion = question;
  };

  function removeQuestion(question: Question) {
      this.questions.delete(question.uuid);
  };

  return { questions, currentQuestion,loadQuestion, loadAllQuestions, addQuestion  }
});
