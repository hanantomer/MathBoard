import Vue from "vue";
import Vuex from "vuex";
import currentPositionStore from "./currentPositionStore";
import notationStore from "./notationStore";
import lessonStore from "./lessonStore";
import userStore from "./userStore";
import studentStore from "./studentStore";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    currentPositionStore,
    notationStore,
    lessonStore,
    userStore,
    studentStore,
  },
});
