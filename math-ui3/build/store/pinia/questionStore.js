//  questions of current lesson
import { defineStore } from "pinia";
import useDbHelper from "../../helpers/dbHelper";
import { useLessonStore } from "./lessonStore";
const lessonStore = useLessonStore();
const db = useDbHelper();
///TODO: create convention for all crud operation for all stores
export const useQuestionStore = defineStore("answer", () => {
    let questions = new Map();
    let currentQuestion = {};
    function getQuestions() {
        return questions;
    }
    function getCurrentQuestion() {
        return currentQuestion;
    }
    async function loadQuestion(questionUUId) {
        currentQuestion = await db.getQuestion(questionUUId);
    }
    ;
    async function loadQuestions() {
        if (!lessonStore.getLessons()) {
            lessonStore.loadLessons();
        }
        let questionsFromDb = await db.getQuestions(lessonStore.getCurrentLesson().uuid);
        questionsFromDb.forEach((q) => {
            questions.set(q.uuid, q);
        });
    }
    ;
    async function addQuestion(question) {
        question.lesson = lessonStore.getCurrentLesson();
        let createdQuestion = await db.addQuestion(question);
        questions.set(createdQuestion.uuid, createdQuestion);
        currentQuestion = createdQuestion;
        return question;
    }
    ;
    function setCurrentQuestion(questionUUId) {
        if (!questions.get(questionUUId)) {
            loadQuestions();
        }
        if (questions.get(questionUUId)) {
            currentQuestion = questions.get(questionUUId);
        }
    }
    ;
    function removeQuestion(question) {
        questions.delete(question.uuid);
    }
    ;
    return {
        getQuestions,
        getCurrentQuestion,
        loadQuestions,
        loadQuestion,
        addQuestion,
        setCurrentQuestion,
        removeQuestion
    };
});
//# sourceMappingURL=questionStore.js.map