//  questions of current lesson
import { defineStore } from "pinia";
import Question, { QuestionAttributes } from "../../../../math-db/src/models/question/question.model";
import useDbHelper  from "../../helpers/dbHelper";
import { useLessonStore } from "./lessonStore";

const lessonStore = useLessonStore();
const db = useDbHelper();

///TODO: create convention for all crud operation for all stores


export const useQuestionStore = defineStore("answer", ()=> {

  let questions: Map<String, QuestionAttributes> = new Map();
  let currentQuestion = <QuestionAttributes>{};

  async function loadQuestion(questionUUId: string) {
      currentQuestion = await db.getQuestion(questionUUId);
  };

  async function loadQuestions() {
    if (!lessonStore.lessons.size) {
      lessonStore.loadLessons();
    }

    let questionsFromDb = await db.getQuestions(lessonStore.currentLesson.uuid);
    questionsFromDb.forEach((q: QuestionAttributes) => {
      this.questions.set(q.uuid, q);
    });
  };

  async function addQuestion(question: QuestionAttributes) {
    question.lessonUUID  = lessonStore.currentLesson.uuid;
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
