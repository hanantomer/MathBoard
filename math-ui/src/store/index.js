import Vue from "vue";
import Vuex from "vuex";
import dbSyncMixin from "../Mixins/dbSyncMixin";

Vue.use(Vuex);

const helper = {
  findSymbolById: function (state, id) {
    return state.symbols.find((n) => n.id === id);
  },
  findSymbolByCoordinates: function (state, symbol) {
    return state.symbols.find(
      (n) => n.col == symbol.col && n.row == symbol.row
    );
  },
  findStudentById: function (state, id) {
    return state.students.find((s) => s.userId === id);
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
    symbols: [],
    currentExercise: {},
    selectedRect: { x: 10, y: 20 },
  },
  getters: {
    getStudent: function (state) {
      return (studentId) => {
        return helper.findStudentById(state, studentId);
      };
    },
    getUser: function (state) {
      return state.user;
    },
    getExercises: (state) => {
      return state.exercises;
    },
    getCurrentExercise: (state) => {
      return state.currentExercise;
    },
    getSymbols: (state) => {
      return state.symbols;
    },
    getSelectedRect: (state) => {
      return state.selectedRect;
    },
    // at least one symbol is selected
    isAnySymbolSelected(state) {
      return state.symbols.find((e) => e.selected === true);
    },
    getSelectedSymbols: (state) => {
      return state.symbols.filter((n) => !!n && n.selected == true);
    },
  },
  mutations: {
    updateSymbol(state, symbol) {
      let oldSymbol = helper.findSymbolById(state, notation.id);
      delete oldSymbol.x; // for reactivity
      delete oldSymbol.y;
      Vue.set(oldSymbol, "x", symbol.x);
      Vue.set(oldSymbol, "y", symbol.y);
    },
    toggleAuthorization(state, studentId) {
      let student = helper.findStudentById(state, studentId);
      state.students
        .filter((s) => s.userId != studentId)
        .forEach((s) => {
          if (!!s.authorized) s.authorized = false;
        });
      student.authorized = student.authorized ? false : true;
    },
    setSelectedRect(state, selectedRect) {
      Vue.set(state, "selectedRect", selectedRect);
    },
    setUser(state, user) {
      console.debug(`commit.setUser:${JSON.stringify(user)}`);
      Vue.set(state, "user", user);
    },
    setStudent(state, student) {
      let existingStudent = state.students.find(
        (s) => s.userId === student.userId
      );
      if (!!existingStudent) {
        existingStudent.updateTime = Date.now();
      } else {
        if (!student.imageUrl) {
          student.imageUrl = "https://joeschmoe.io/api/v1/" + student.userId;
        }
        student.updateTime = Date.now();
        state.students.push(student);
      }
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
    addSymbol(state, symbol) {
      Vue.set(symbol, "selected", false);
      let oldSymbol = helper.findSymbolByCoordinates(state, symbol);
      if (!!oldSymbol) {
        delete oldSymbol.value;
        Vue.set(oldSymbol, "value", symbol.value);
      } else {
        state.symbols.push(symbol);
      }
    },

    removeSymbol(state, symbol) {
      state.symbols = state.symbols.filter(
        (n) => !(n.col === symbol.col && n.row === symbol.row)
      );
    },
    updateSelectedSymbolCoordinates(state) {
      state.symbols
        .filter((symbol) => symbol.selected === true)
        .forEach(
          async (symbol) =>
            await dbSyncMixin.methods.updateSymbolCoordinates(symbol)
        );
    },
    removeAllExercises(state) {
      state.exercises = [];
    },
    selectSymbol(state, id) {
      let symbol = helper.findSymbolById(state, id);
      delete symbol.selected; // for reactivity
      Vue.set(symbol, "selected", true);
    },
    unselectAllSymbols(state) {
      state.symbols
        .filter((n) => n.selected === true)
        .forEach((n) => {
          delete n.selected; // for reactivity
          Vue.set(n, "selected", false);
        });
    },
    moveSelectedSymbols(state, payload) {
      state.symbols
        .filter((symbol) => !!symbol.selected)
        .forEach((symbol) => {
          let col = symbol.col;
          let row = symbol.row;
          delete symbol.col;
          delete symbol.row;
          Vue.set(
            symbol,
            "col",
            col + Math.round(payload.deltaX / payload.rectSize)
          );
          Vue.set(
            symbol,
            "row",
            row + Math.round(payload.deltaY / payload.rectSize)
          );
        });
    },
    removeAllSymbols(state, payload) {
      state.symbols = [];
    },
  },
  actions: {
    toggleAuthorization(context, studentId) {
      let prevAuthorizedStudent = context.state.students.find(
        (s) => !!s.authorized
      );
      context.commit("toggleAuthorization", studentId);

      let authorizedStudentId = !!helper.findStudentById(
        context.state,
        studentId
      ).authorized
        ? studentId
        : null;

      let revokedStudentId = null;
      if (!authorizedStudentId) {
        revokedStudentId = studentId;
      }
      if (!revokedStudentId && !!prevAuthorizedStudent) {
        revokedStudentId = prevAuthorizedStudent.userId;
      }

      return {
        authorizedStudentId: authorizedStudentId,
        revokedStudentId: revokedStudentId,
      };
    },
    updateUserHeartbeat(context, student) {
      context.commit("setStudent", student);
    },
    setAuthorization(context, student) {
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

    async loadSymbols(context, exerciseId) {
      context.commit("removeAllSymbols");
      dbSyncMixin.methods.getAllSymbols(exerciseId).then((symbols) => {
        symbols.forEach((symbol) => {
          context.commit("addSymbol", symbol);
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
    upsertSymbol(context, symbol) {
      return dbSyncMixin.methods.upsertSymbol(symbol);
    },
    syncIncomingAddedNotaion(context, symbol) {
      context.commit("addSymbol", symbol);
    },
    syncIncomingDeletedNotaion(context, symbol) {
      context.commit("removeSymbol", symbol);
    },
    syncIncomingUpdatedNotaion(context, symbol) {
      context.commit("upsertSymbol", symbol);
    },
    removeSelectedSymbols(context) {
      // commit is called by syncIncomingDeletedNotaion
      dbSyncMixin.methods.removeSymbols(
        //context.getters.getSelectedSymbols.map((s) => s.id).join(",")
        context.getters.getSelectedSymbols
      );
    },
    selectSymbol(context, id) {
      context.commit("selectSymbol", id);
    },
    unselectAllSymbols(context) {
      context.commit("unselectAllSymbols");
    },
    moveSelectedSymbols(context, payload) {
      context.commit("moveSelectedSymbols", payload);
    },
    updateSelectedSymbolCoordinates(context, payload) {
      context.commit("updateSelectedSymbolCoordinates", payload);
    },
    setSelectedRect(context, payload) {
      context.commit("setSelectedRect", payload);
    },
    setDimensions(context, payload) {
      context.commit("setNumberOfCols", payload.numberOfCols);
      context.commit("setNumberOfRows", payload.numberOfRows);
    },
    toggeleStudentAuthorization(context, studentId) {
      context.commit("toggelStudentAuthorization", studentId);
    },
  },
});
