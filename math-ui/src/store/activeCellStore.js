import Vue from "vue";

export default {
  state: {
    activeCellArr: [],
  },
  getters: {
    getActiveCellArr: (state) => {
      return state.activeCellArr;
    },
    getLastActiveCell: (state) => {
      return state.activeCellArr?.slice(-1)[0];
    },
  },
  mutations: {
    setActiveCellArr(state, activeCellArr) {
      Vue.set(state, "activeCellArr", activeCellArr);
    },
  },
  actions: {
    setActiveCellArr(context, activeCellArr) {
      context.commit("setActiveCellArr", activeCellArr);
    },
  },
};
