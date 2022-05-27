import Vue from "vue";

export default {
  state: {
    currentRect: { x: 0, y: 0 },
  },
  getters: {
    getcurrentRect: (state) => {
      return state.currentRect;
    },
  },
  mutations: {
    setCurrentRect(state, currentRect) {
      Vue.set(state, "currentRect", currentRect);
    },
  },
  actions: {
    setCurrentRect(context, currentRect) {
      context.commit("setCurrentRect", currentRect);
    },
  },
};
