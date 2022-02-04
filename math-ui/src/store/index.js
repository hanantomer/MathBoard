import Vue from "vue";
import Vuex from "vuex";
import fractionLine from "./fractionLine";
import symbol from "./symbol";
import exercise from "./exercise";
import user from "./user";
import student from "./student";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    fractionLine,
    symbol,
    exercise,
    user,
    student,
  },
});
