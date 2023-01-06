//  answers of current question
import dbSyncMixin from "../Mixins/dbSyncMixin";

const helper = {
  findAnswerById: function (state, id) {
    return state.answers.find((s) => s.id == id);
  },
};

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
    addAnswer(state, answer) {
      state.answers.push(answer);
    },
    setCurrentAnswer(state, answer) {
      state.currentAnswer = answer;
    },
    removeAnswer(state, id) {
      state.answers.splice(helper.findAnswerById(state, id), 1);
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
        context.getters.getCurrentLesson.uuid
      );
      if (answers.data.length > 0) {
        answers.data.forEach((e) => {
          context.commit("addAnswer", e);
        });
      }
      return answers.data.length > 0;
    },
    async addAnswer(context) {
      if (
        context.getters.getAnswers.find(
          (a) => a.uuid == context.getters.getCurrentQuestion.uuid
        ) != null
      ) {
        return;
      }
      let answer = {};
      answer.QuestionUUId = context.getters.getCurrentQuestion.uuid;
      answer.UserId = context.getters.getUser.id;
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
