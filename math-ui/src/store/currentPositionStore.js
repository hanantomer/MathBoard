import Vue from "vue";

export default {
  state: {
    currentRect: { x: 0, y: 0 },
    currentFraction: { x: 0, y: 0 },
  },
  getters: {
    getcurrentRect: (state) => {
      return state.currentRect;
    },
    getcurrentFraction: (state) => {
      return state.currentFraction;
    },
  },
  mutations: {
    setCurrentRect(state, currentRect) {
      Vue.set(state, "currentRect", currentRect);
    },
    setCurrentFraction(state, currentFraction) {
      Vue.set(state, "currentFraction", currentFraction);
    },
  },
  actions: {
    setCurrentRect(context, payload) {
      context.commit("setCurrentRect", payload);
    },
    setCurrentFraction(context, payload) {
      context.commit("setCurrentFraction", payload);
    },
  },
};
