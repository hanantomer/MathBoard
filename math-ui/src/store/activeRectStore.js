import Vue from "vue";

export default {
  state: {
    activeRect: { x: 0, y: 0 },
  },
  getters: {
    getActiveRect: (state) => {
      return state.activeRect;
    },
  },
  mutations: {
    setActiveRect(state, activeRect) {
      Vue.set(state, "activeRect", activeRect);
    },
  },
  actions: {
    setActiveRect(context, activeRect) {
      context.commit("setActiveRect", activeRect);
    },
  },
};
