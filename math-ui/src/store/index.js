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
    user: {},
    students: [],
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
    getCurrentExercise: (state) => {
      return state.currentExercise;
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
    getSelectedNotations: (state) => {
      return state.notations.filter((n) => !!n && n.selected == true);
    },
  },
  mutations: {
    setCursorPosition(state, cursorPosition) {
      Vue.set(state, "cursorPosition", cursorPosition);
    },
    setUser(state, user) {
      console.debug(`commit.setUser:${JSON.stringify(user)}`);
      Vue.set(state, "user", user);
    },
    setStudent(state, student) {
      Vue.set(student, "updateTime", Date.now());
      let existingStudent = state.students.find((s) => s.id === student.id);
      if (!!existingStudent) existingStudent = student;
      else state.students.push(student);
    },
    addExercise(state, exercise) {
      state.exercises.push(exercise);
    },
    setCurrentExercise(state, exercise) {
      state.currentExercise = exercise;
    },
    removeExercise(state, id) {
      state.exercises.splice(helper.find(state, id), 1);
    },
    addNotation(state, notation) {
      Vue.set(notation, "selected", false);
      state.notations.push(notation);
    },
    updateNotationPosition(state, notation) {
      let oldNotation = helper.findNotationById(state, notation.id);
      delete oldNotation.x; // for reactivity
      delete oldNotation.y;
      Vue.set(oldNotation, "x", notation.x);
      Vue.set(oldNotation, "y", notation.y);
    },
    removeNotation(state, notation) {
      state.notations = state.notations.filter(
        (n) => !(n.x === notation.x && n.y === notation.y)
      );
    },
    updateSelectedNotations(state) {
      state.notations
        .filter((notation) => notation.selected === true)
        .forEach(
          async (notation) => await dbSyncMixin.methods.updateNotation(notation)
        );
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
      state.notations
        .filter((notation) => !!notation.selected)
        .forEach((notation) => {
          let x = notation.x;
          let y = notation.y;
          delete notation.x;
          delete notation.y;
          Vue.set(notation, "x", x + payload.deltaX);
          Vue.set(notation, "y", y + payload.deltaY);
        });
    },
  },
  actions: {
    updateUserHeartbeat(context, student) {
      context.commit("setStudent", student);
    },
    async createAccessLink(context, accessLink) {
      return dbSyncMixin.methods.createAccessLink(
        accessLink.ExerciseId,
        accessLink.link
      );
    },
    async authLocalUserByToken(context) {
      return dbSyncMixin.methods.authLocalUserByToken();
    },
    async authLocalUserByPassword(context, user) {
      return dbSyncMixin.methods.authLocalUserByPassword(
        user.email,
        user.password
      );
    },
    async authGoogleUser(context) {
      let user = await dbSyncMixin.methods.authGoogleUser();
      console.debug(user);
      return user;
    },
    async registerUser(context, user) {
      return dbSyncMixin.methods.registerUser(user);
    },
    async setUser(context, user) {
      context.commit("setUser", user);
      return user;
    },

    async loadNotations(context, exerciseId) {
      context.commit("removeAllNotation");
      dbSyncMixin.methods.getAllNotations(exerciseId).then((notations) => {
        notations.forEach((notation) => {
          context.commit("addNotation", notation);
        });
      });
    },
    async loadExercise(context, exerciseId) {
      let exercise = await dbSyncMixin.methods.getExercise(exerciseId);
      if (!!exercise) {
        context.commit("addExercise", exercise);
        context.commit("setCurrentExercise", exercise);
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
    setCurrentExercise(context, payload) {
      context.commit("setCurrentExercise", payload);
    },
    removeExercise(context, payload) {
      context.commit("removeExercise", payload.id);
    },
    addSymbol(context, notation) {
      return dbSyncMixin.methods.addSymbol(notation);
    },
    syncIncomingAddedNotaion(context, notation) {
      context.commit("addNotation", notation);
    },
    syncIncomingDeletedNotaion(context, notation) {
      context.commit("removeNotation", notation);
    },
    syncIncomingUpdatedNotaion(context, notation) {
      context.commit("updateNotationPosition", notation);
    },
    removeSelectedSymbols(context) {
      // commit is called by syncIncomingDeletedNotaion
      dbSyncMixin.methods.removeSymbols(
        context.getters.getSelectedNotations.map((s) => s.id).join(",")
      );
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
    updateSelectedNotations(context, payload) {
      context.commit("updateSelectedNotations", payload);
    },
    setCursorPosition(context, payload) {
      context.commit("setCursorPosition", payload);
      //      payload.userId = context.getters.getUser.id;
    },
    setDimensions(context, payload) {
      context.commit("setNumberOfCols", payload.numberOfCols);
      context.commit("setNumberOfRows", payload.numberOfRows);
    },
  },
});
