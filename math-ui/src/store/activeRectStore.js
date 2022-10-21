import Vue from "vue";

export default {
  state: {
    activeRectArr: [],
  },
  getters: {
    getActiveRectArr: (state) => {
      return state.activeRectArr;
    },
  },
  mutations: {
    setActiveRectArr(state, activeRectArr) {
      Vue.set(state, "activeRectArr", activeRectArr);
    },
  },
  actions: {
    setActiveRectArr(context, activeRectArr) {
      context.commit("setActiveRectArr", activeRectArr);
    },
  },
};
