//  questions of current lesson
import dbSyncMixin from "../Mixins/dbSyncMixin";

const helper = {
  findQuestionById: function (state, id) {
    return state.questions.find((q) => q.id == id);
  },
};

export default {
  modules: {
    dbSyncMixin,
  },
  state: {
    questions: [],
    currentQuestion: {},
  },
  getters: {
    getQuestions: (state) => {
      return state.questions;
    },
    getCurrentQuestion: (state) => {
      return state.currentQuestion;
    },
  },
  mutations: {
    addQuestion(state, question) {
      state.questions.push(question);
    },

    setCurrentQuestion(state, question) {
      state.currentQuestion = question;
    },
    removeQuestion(state, id) {
      state.questions.splice(helper.findQuestionById(state, id), 1);
    },
    removeAllQuestions(state) {
      state.questions = [];
    },
  },
  actions: {
    async loadQuestion(context, questionUUId) {
      let question = await dbSyncMixin.methods.getQuestion(questionUUId);
      if (!!question) {
        context.commit("setCurrentQuestion", question);
      }
    },
    async loadQuestions(context) {
      context.commit("removeAllQuestions");
      let questions = await dbSyncMixin.methods.getQuestions(
        context.getters.getCurrentLesson.uuid
      );
      if (questions.data.length > 0) {
        questions.data.forEach((e) => {
          context.commit("addQuestion", e);
        });
      }
      return questions.data.length > 0;
    },

    async addQuestion(context, question) {
      question.LessonUUId = context.getters.getCurrentLesson.uuid;
      question = await dbSyncMixin.methods.addQuestion(question);
      context.commit("addQuestion", question.data);
      return question.data;
    },
    setCurrentQuestion(context, question) {
      context.commit("setCurrentQuestion", question);
    },
    removeQuestion(context, question) {
      context.commit("removeQuestion", question.uuid);
    },
  },
};