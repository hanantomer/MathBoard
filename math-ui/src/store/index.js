import Vue from "vue";
import Vuex from "vuex";
import currentPositionStore from "./currentPositionStore";
import notationStore from "./notationStore";
import exerciseStore from "./exerciseStore";
import userStore from "./userStore";
import studentStore from "./studentStore";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    currentPositionStore,
    notationStore,
    exerciseStore,
    userStore,
    studentStore,
  },
});
