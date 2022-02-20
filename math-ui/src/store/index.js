import Vue from "vue";
import Vuex from "vuex";
import rectStore from "./rectStore";
import lineStore from "./lineStore";
import symbolStore from "./symbolStore";
import fractionStore from "./fractionStore";
import exerciseStore from "./exerciseStore";
import userStore from "./userStore";
import studentStore from "./studentStore";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    rectStore,
    lineStore,
    symbolStore,
    fractionStore,
    exerciseStore,
    userStore,
    studentStore,
  },
});
