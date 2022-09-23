//  answers of current question
import dbSyncMixin from "../Mixins/dbSyncMixin";

export default {
  modules: {
    dbSyncMixin,
  },
  state: {
    answers: [],
    currentAnswer: {},
  },
  getters: {
    getAnswers: (state) => {
      return state.answers;
    },
    getCurrentAnswer: (state) => {
      return state.currentAnswer;
    },
  },
  mutations: {
    addAnswers(state, answer) {
      state.answers.push(answer);
    },
    setCurrentAnswer(state, answer) {
      state.currentAnswer = answer;
    },
    removeAnswer(state, id) {
      state.answers.splice(helper.find(state, id), 1);
    },
    removeAllAnswers(state) {
      state.answers = [];
    },
  },
  actions: {
    async loadAnswer(context, answerId) {
      let answer = await dbSyncMixin.methods.getAnswer(answerId);
      if (!!answer) {
        context.commit("addAnswer", answer);
        context.commit("setCurrentAnswer", answer);
      }
    },
    async loadAnswers(context) {
      context.commit("removeAllAnswers");
      let answers = await dbSyncMixin.methods.getAnswers(
        context.getters.getCurrentLesson.id
      );
      if (answers.data.length > 0) {
        answers.data.forEach((e) => {
          context.commit("addAnswer", e);
        });
      }
      return answers.data.length > 0;
    },
    async addAnswer(context, answer) {
      answer.LessonId = context.getters.getCurrentLesson.id;
      answer = await dbSyncMixin.methods.addAnswer(answer);
      context.commit("addAnswer", answer.data);
      return answer.data;
    },
    setCurrentAnswer(context, answer) {
      context.commit("setCurrentAnswer", answer);
    },
    removeAnswer(context, answer) {
      context.commit("removeAnswer", answer.id);
    },
  },
};
