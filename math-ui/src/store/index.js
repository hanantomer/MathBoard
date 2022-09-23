import Vue from "vue";
import Vuex from "vuex";
import activeRectStore from "./activeRectStore";
import notationStore from "./notationStore";
import lessonStore from "./lessonStore";
import questionStore from "./questionStore";
import answerStore from "./answerStore";
import userStore from "./userStore";
import studentStore from "./studentStore";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    activeRectStore,
    notationStore,
    lessonStore,
    questionStore,
    answerStore,
    userStore,
    studentStore,
  },
});
