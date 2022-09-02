import dbSyncMixin from "../Mixins/dbSyncMixin";

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
    addQuestions(state, question) {
      state.questions.push(question);
    },
    setCurrentQuestion(state, question) {
      state.currentQuestion = question;
    },
    removeQuestion(state, id) {
      state.questions.splice(helper.find(state, id), 1);
    },
    removeAllQuestions(state) {
      state.questions = [];
    },
  },
  actions: {
    async loadQuestion(context, questionId) {
      let question = await dbSyncMixin.methods.getQuestion(questionId);
      if (!!question) {
        context.commit("addQuestion", question);
        context.commit("setCurrentQuestion", question);
      }
    },
    async loadQuestions(context) {
      context.commit("removeAllQuestions");
      let questions = await dbSyncMixin.methods.getQuestions(
        context.getters.getCurrentLesson.id
      );
      if (questions.data.length > 0) {
        questions.data.forEach((e) => {
          context.commit("addQuestion", e);
        });
      }
      return questions.data.length > 0;
    },
    async addQuestion(context, question) {
      question.LessonId = context.getters.getCurrentLesson.id;
      question = await dbSyncMixin.methods.addQuestion(question);
      context.commit("addQuestion", question.data);
      return question.data;
    },
    setCurrentQuestion(context, question) {
      context.commit("setCurrentQuestion", question);
    },
    removeQuestion(context, question) {
      context.commit("removeQuestion", question.id);
    },
  },
};
