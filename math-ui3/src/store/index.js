import Vuex from "vuex";
import notationStore from "./notationStore";
import lessonStore from "./lessonStore";
import questionStore from "./questionStore";
import answerStore from "./answerStore";
import userStore from "./userStore";
import studentStore from "./studentStore";


export default new Vuex.Store({
  modules: {
    notationStore,
    lessonStore,
    questionStore,
    answerStore,
    userStore,
    studentStore,
  },
});
