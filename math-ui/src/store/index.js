import Vue from "vue";
import Vuex from "vuex";
import rectStore from "./rectStore";
// import symbolStore from "./symbolStore";
// import fractionStore from "./fractionStore";
import notationStore from "./notationStore";
import exerciseStore from "./exerciseStore";
import userStore from "./userStore";
import studentStore from "./studentStore";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    rectStore,
    notationStore,
    exerciseStore,
    userStore,
    studentStore,
  },
});
