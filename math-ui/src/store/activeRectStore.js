import Vue from "vue";

export default {
  state: {
    activeRect: { x: 0, y: 0 },
    prevActiveRect: null,
  },
  getters: {
    getActiveRect: (state) => {
      return state.activeRect;
    },
    getPrevActiveRect: (state) => {
      return state.prevActiveRect;
    },
  },
  mutations: {
    setActiveRect(state, activeRect) {
      Vue.set(state, "activeRect", activeRect);
    },
    setPrevActiveRect(state, activeRect) {
      Vue.set(state, "prevActiveRect", activeRect);
    },
  },
  actions: {
    setActiveRect(context, activeRect) {
      context.commit("setActiveRect", activeRect);
    },
    setPrevActiveRect(context, activeRect) {
      context.commit("setPrevActiveRect", activeRect);
    },
  },
};
