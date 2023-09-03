import { defineStore } from "pinia";
import useDbHelper from "../../helpers/dbHelper";
import { useQuestionStore } from "./questionStore";
import { useUserStore } from "./userStore";
const questionStore = useQuestionStore();
const userStore = useUserStore();
const db = useDbHelper();
export const useAnswerStore = defineStore("answer", () => {
    let answers = new Map();
    let currentAnswer = {};
    async function loadAnswer(answerUUId) {
        const answer = await db.getAnswer(answerUUId);
        const question = await db.getQuestion(answer.question.uuid);
        if (answer) {
            answers.set(answer.uuid, answer);
            currentAnswer = answer;
            questionStore.loadQuestion(question.uuid);
        }
    }
    ;
    async function loadAnswers() {
        if (!questionStore.questions.size) {
            questionStore.loadQuestions();
        }
        const answersFromDb = await db.getAnswers(questionStore.currentQuestion.uuid);
        answersFromDb.forEach((a) => {
            answers.set(a.uuid, a);
        });
    }
    ;
    // answer is initially empty
    async function addAnswer() {
        let answerForCurrentQuestion = null;
        answers.forEach((a) => {
            if (a.question.uuid == questionStore.currentQuestion.uuid) {
                answerForCurrentQuestion = a;
                return;
            }
        });
        if (answerForCurrentQuestion)
            return;
        let answer = {};
        answer.question = questionStore.currentQuestion;
        answer.user = userStore.currentUser;
        answer = await db.addAnswer(answer);
        answers.set(answer.uuid, answer);
        setCurrentAnswer(answer);
    }
    ;
    function setCurrentAnswer(answer) {
        currentAnswer = answer;
    }
    ;
    function removeAnswer(answer) {
        answers.delete(answer.uuid);
    }
    ;
    return { answers, currentAnswer, loadAnswer, loadAnswers, addAnswer, setCurrentAnswer, removeAnswer };
});
//# sourceMappingURL=answerStore.js.map