import Vue from "vue";
import Vuex from "vuex";
import selectedNotationStore from "./selectedNotationStore";
import notationStore from "./notationStore";
import exerciseStore from "./exerciseStore";
import userStore from "./userStore";
import studentStore from "./studentStore";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    selectedNotationStore,
    notationStore,
    exerciseStore,
    userStore,
    studentStore,
  },
});
