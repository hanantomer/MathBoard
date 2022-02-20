import Vue from "vue";

export default {
  state: {
    selectedRect: { x: 0, y: 0 },
    selectedFractionPart: { xOffset: 0, fractionPosition: "TopLeft" },
  },
  getters: {
    getSelectedRect: (state) => {
      return state.selectedRect;
    },
    getSelectedFractionPart: (state) => {
      return state.selectedFractionPart;
    },
  },
  mutations: {
    setSelectedRect(state, selectedRect) {
      Vue.set(state, "selectedRect", selectedRect);
    },
    setSelectedFractionPart(state, selectedFractionPart) {
      Vue.set(state, "selectedFractionPart", selectedFractionPart);
    },
  },
  actions: {
    setSelectedRect(context, payload) {
      context.commit("setSelectedRect", payload);
    },
    setSelectedFractionPart(context, payload) {
      context.commit("selectedFractionPart", payload);
    },
  },
};
