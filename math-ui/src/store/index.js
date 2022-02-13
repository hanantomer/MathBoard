import Vue from "vue";
import Vuex from "vuex";
import lineStore from "./lineStore";
import symbolStore from "./symbolStore";
import exerciseStore from "./exerciseStore";
import userStore from "./userStore";
import studentStore from "./studentStore";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    lineStore,
    symbolStore,
    exerciseStore,
    userStore,
    studentStore,
  },
});
