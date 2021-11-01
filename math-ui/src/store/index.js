import Vue from "vue";
import Vuex from "vuex";
import dbSyncMixin from "../Mixins/dbSyncMixin";
import positionMixin from "../Mixins/positionMixin";

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
    positionMixin,
  },
  state: {
    user: {},
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
    removeAllExercises(state) {
      state.exercises = [];
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
  },
  actions: {
    async createAccessLink(context, accessLink) {
      return await dbSyncMixin.methods.createAccessLink(
        accessLink.exerciseId,
        accessLink.link
      );
    },
    async authLocalUserByToken(context) {
      return await dbSyncMixin.methods.authLocalUserByToken();
    },
    async authLocalUserByPassword(context, user) {
      return await dbSyncMixin.methods.authLocalUserByPassword(
        user.email,
        user.password
      );
    },
    async authGoogleUser(context, googleUser) {
      let user = await dbSyncMixin.methods.authGoogleUser();
      console.debug(user);
      return user;
    },
    async registerUser(context, user) {
      let registeredUser = await dbSyncMixin.methods.registerUser(user);
      if (!!registeredUser) {
        registeredUser = {
          ...registeredUser,
          ...user,
          ...{ password: null },
        };
        context.commit("setUser", registeredUser);
        return registeredUser;
      }
    },
    async setUser(context, user) {
      context.commit("setUser", user);
      return user;
    },

    async loadNotations(context, exerciseId) {
      context.commit("removeAllNotation");
      let notations = dbSyncMixin.methods.getAllNotations(exerciseId);
      if (notations.length > 0) {
        notations.forEach((n) => {
          context.commit("addNotation", n);
        });
      }
    },
    async loadExercises(context) {
      context.commit("removeAllExercises");
      let exercises = await dbSyncMixin.methods.getAllExercises(
        context.getters.getUser
      );
      if (exercises.data.length > 0) {
        exercises.data.forEach((e) => {
          context.commit("addExercise", e);
        });
      }
      return exercises.data.length > 0;
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
    addSymbol(context, symbolValue) {
      let nextPosition = positionMixin.methods.positionMixin_getNext(
        symbolValue,
        context.getters.getCursorPosition
      );
      context.commit("setCursorPosition", nextPosition);

      let symbol = Object.assign(symbolValue, nextPosition);

      dbSyncMixin.methods.addSymbol(symbol).then((symbol) => {
        context.commit("addNotation", symbol);
      });
    },
    async syncIncomingNotaion(context, notation) {
      context.commit("addNotation", notation);
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
