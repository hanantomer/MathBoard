import Vue from "vue";

export default {
  state: {
    selectedRect: { x: 0, y: 0 },
  },
  getters: {
    getSelctedRect: (state) => {
      return state.selectedRect;
    },
  },
  mutations: {
    setSelectedRect(state, selectedRect) {
      Vue.set(state, "selectedRect", selectedRect);
    },
  },
  actions: {
    setSelectedRect(context, selectedRect) {
      context.commit("setSelectedRect", selectedRect);
    },
  },
};
