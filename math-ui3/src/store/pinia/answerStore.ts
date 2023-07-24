import { defineStore } from "pinia";
import { AnswerAttributes } from "../../../../math-db/src/models/answer/answer.model";
import { QuestionAttributes } from "../../../../math-db/src/models/question/question.model";
import  useDbHelper  from "../../helpers/dbHelper";
import { useQuestionStore } from "./questionStore";
import { useUserStore } from "./userStore";

const questionStore = useQuestionStore();
const userStore = useUserStore();
const db = useDbHelper();

export const useAnswerStore = defineStore("answer", () => {

  let answers: Map<String, AnswerAttributes> = new Map();
  let currentAnswer = <AnswerAttributes>{};

  async function loadAnswer(answerUUId: string) {
      const answer = await db.getAnswer(answerUUId);
      const question = await db.getQuestion(answer.question.uuid);

      if (answer) {
        answers.set(answer.uuid, answer);
        currentAnswer = answer;
        questionStore.loadQuestion(question.uuid);
      }
  };

  async function loadAnswers() {
    if (!questionStore.questions.size) {
      questionStore.loadQuestions();
    }

    const answersFromDb = await db.getAnswers(questionStore.currentQuestion.uuid );
    answersFromDb.forEach((a: AnswerAttributes) => {
      answers.set(a.uuid, a);
    });
  };

  // answer is initially empty
  async function addAnswer() {
      let answerForCurrentQuestion: AnswerAttributes|null = null;
      answers.forEach((a : AnswerAttributes)  => {
        if (a.question.uuid == questionStore.currentQuestion.uuid) {
          answerForCurrentQuestion = a;
          return;
        }
      });
      if (answerForCurrentQuestion) return;

      let answer = <AnswerAttributes>{};
      answer.question  = questionStore.currentQuestion;
      answer.user = userStore.currentUser!;

      answer = await db.addAnswer(answer);
      answers.set(answer.uuid, answer);
      setCurrentAnswer(answer)
  };

  function setCurrentAnswer(answer: AnswerAttributes) {
    currentAnswer = answer;
  };

  function removeAnswer(answer: AnswerAttributes) {
    answers.delete(answer.uuid);
  };

  return {answers, currentAnswer, loadAnswer, loadAnswers, addAnswer, setCurrentAnswer, removeAnswer}
});
