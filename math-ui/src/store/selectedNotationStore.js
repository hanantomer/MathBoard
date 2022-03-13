import Vue from "vue";

export default {
  state: {
    selectedRect: { x: 0, y: 0 },
    selectedFraction: { x: 0, y: 0 },
  },
  getters: {
    getSelectedRect: (state) => {
      return state.selectedRect;
    },
    getSelectedFraction: (state) => {
      return state.selectedFraction;
    },
  },
  mutations: {
    setSelectedRect(state, selectedRect) {
      Vue.set(state, "selectedRect", selectedRect);
    },
    setSelectedFraction(state, selectedFraction) {
      Vue.set(state, "selectedFraction", selectedFraction);
    },
  },
  actions: {
    setSelectedRect(context, payload) {
      context.commit("setSelectedRect", payload);
    },
    setSelectedFraction(context, payload) {
      context.commit("setSelectedFraction", payload);
    },
  },
};
