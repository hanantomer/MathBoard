import Vue from "vue";
import Vuex from "vuex";
import dbSyncMixin from "../Mixins/dbSyncMixin";

Vue.use(Vuex);

const SymbolType = {
  1: "Sign",
  2: "Number",
  3: "Triangle",
};

const helper = {
  findNotationById: function (state, id) {
    return state.notations.find((n) => n.id === id);
  },
};

export default new Vuex.Store({
  modules: {
    dbSyncMixin,
  },
  state: {
    user: { id: null, imageUrl: null, name: null },
    exercises: [],
    notations: [],
    currentExercise: {},
    cursorPosition: { x: 10, y: 20 },
  },
  getters: {
    getUser: function (state) {
      return state.user;
    },
    getExercises: (state) => {
      return state.exercises;
    },
    getNotations: (state) => {
      return state.notations;
    },
    getCursorPosition: (state) => {
      return state.cursorPosition;
    },
    isAnnotationSelected(state) {
      return state.notations.find((e) => e.selected === true);
    },
  },
  mutations: {
    setCursorPosition(state, cursorPosition) {
      state.cursorPosition = Object.assign(
        {},
        state.cursorPosition,
        cursorPosition
      );
    },
    setUser(state, user) {
      Vue.set(state, "user", user);
    },
    addExercise(state, exercise) {
      state.exercises.push(exercise);
    },
    removeExercise(state, id) {
      state.exercises.splice(helper.find(state, id), 1);
    },
    addNotation(state, notation) {
      Vue.set(notation, "selected", false);
      state.notations.push(notation);
    },
    removeSelectedSymbols(state, id) {
      state.notations = state.notations.filter((n) => {
        return n.selected == false;
      });
    },
    removeAllNotation(state) {
      state.notations = [];
    },

    selectNotation(state, id) {
      let notation = helper.findNotationById(state, id);
      delete notation.selected; // for reactivity
      Vue.set(notation, "selected", true);
    },
    unselectAllNotations(state) {
      state.notations
        .filter((n) => n.selected === true)
        .forEach((n) => {
          delete n.selected; // for reactivity
          Vue.set(n, "selected", false);
        });
    },
    moveSelectedNotations(state, payload) {
      state.notations.forEach((notation) => {
        if (notation.selected === true) {
          let x = notation.x;
          let y = notation.y;
          delete notation.x;
          delete notation.y;
          Vue.set(notation, "x", x + payload.deltaX);
          Vue.set(notation, "y", y + payload.deltaY);
        }
      });
    },
    // async addUser(state, user) {
    //   return dbSyncMixin.methods.addUser(user).then((user) => {
    //     return user;
    //   });
    // },
  },
  actions: {
    authUser(context, payload) {
      return dbSyncMixin.methods.getUser(payload);
    },
    async registerUser(context, payload) {
      let user = await dbSyncMixin.methods.setUser(payload);
      if (!!user) {
        user = { ...payload, ...user, ...{ password: null } };
        context.commit("setUser", user);
      }
    },
    async setUser(context, user) {
      //if (!user.id) {
      ////  user = await dbSyncMixin.methods.setUser(user);
      ///}
      context.commit("setUser", user);
    },

    loadNotations(context, exerciseId) {
      context.commit("removeAllNotation");
      dbSyncMixin.methods.getAllNotations(exerciseId).then((notations) => {
        notations.forEach((n) => {
          context.commit("addNotation", n);
        });
      });
    },
    loadExercises(context, payload) {
      return dbSyncMixin.methods
        .getAllExercises(context.getters.getUser.id)
        .then((exercises) => {
          exercises.data.forEach((e) => {
            context.commit("addExercise", e);
          });
          return exercises.data.length > 0;
        });
    },
    addExercise(context, payload) {
      const exercise = payload;
      exercise.UserId = context.getters.getUser.id;
      return new Promise((resolve, reject) => {
        dbSyncMixin.methods
          .addExercise(exercise)
          .then((exercise) => {
            context.commit("addExercise", exercise.data);
            resolve(exercise.data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    removeExercise(context, payload) {
      context.commit("removeExercise", payload.id);
    },
    addSymbol(context, payload) {
      let symbol = Object.assign(payload, context.getters.getCursorPosition);

      dbSyncMixin.methods.addSymbol(symbol).then((symbol) => {
        context.commit("addNotation", symbol);
      });
    },
    async removeSelectedSymbols(context) {
      context.state.notations
        .filter((n) => {
          return n.selected == true;
        })
        .forEach((n) => {
          dbSyncMixin.methods.removeSymbol(n.id);
        });

      context.commit("removeSelectedSymbols");
    },
    selectNotation(context, id) {
      context.commit("selectNotation", id);
    },
    unselectAllNotations(context) {
      context.commit("unselectAllNotations");
    },
    moveSelectedNotations(context, payload) {
      context.commit("moveSelectedNotations", payload);
    },
    updateSelectedNotations(context) {
      context.state.notations
        .filter((notation) => notation.selected === true)
        .forEach((notation) => dbSyncMixin.methods.updateNotation(notation));
    },
    setCursorPosition(context, payload) {
      context.commit("setCursorPosition", payload);
    },
    setDimensions(context, payload) {
      context.commit("setNumberOfCols", payload.numberOfCols);
      context.commit("setNumberOfRows", payload.numberOfRows);
    },
  },
});
