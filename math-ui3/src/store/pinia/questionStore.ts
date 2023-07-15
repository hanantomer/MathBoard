//  questions of current lesson
import { defineStore } from "pinia";
import Question from "../../../../math-db/src/models/question/question.model";
import useDbHelper  from "../../helpers/dbHelper";
import { useLessonStore } from "./lessonStore";

const lessonStore = useLessonStore();
const db = useDbHelper();

///TODO: create convention for all crud operation for all stores


export const useQuestionStore = defineStore("answer", ()=> {

  let questions: Map<String, Question> = new Map();
  let currentQuestion: Question = new Question();

  async function loadQuestion(questionUUId: string) {
      currentQuestion = await db.getQuestion(questionUUId);
  };

  async function loadQuestions() {
    if (!lessonStore.lessons.size) {
      lessonStore.loadLessons();
    }

    let questionsFromDb = await db.getQuestions(lessonStore.currentLesson.uuid);
    questionsFromDb.forEach((q: Question) => {
      this.questions.set(q.uuid, q);
    });
  };

  async function addQuestion(question: Question) {
    question.lesson  = lessonStore.currentLesson;
    question = await db.addQuestion(question);
    this.questions.set(question.uuid, question);
    currentQuestion = question;
    return question;
  };

  function setCurrentQuestion(questionUUId: string) {

    if (!questions.get(questionUUId)) {
      loadQuestions();
    }
    if (questions.get(questionUUId)) {
      currentQuestion = questions.get(questionUUId)!;
    }
  };

  function removeQuestion(question: Question) {
      this.questions.delete(question.uuid);
  };

  return {
    questions,
    currentQuestion,
    loadQuestions,
    loadQuestion,
    addQuestion,
    setCurrentQuestion,
    removeQuestion
  };
});
