import dbSyncMixin from "../Mixins/dbSyncMixin";

export default {
  modules: {
    dbSyncMixin,
  },
  state: {
    exercises: [],
    currentExercise: {},
  },
  getters: {
    getExercises: (state) => {
      return state.exercises;
    },
    getCurrentExercise: (state) => {
      return state.currentExercise;
    },
  },
  mutations: {
    addExercise(state, exercise) {
      state.exercises.push(exercise);
    },
    setCurrentExercise(state, exercise) {
      state.currentExercise = exercise;
    },
    removeExercise(state, id) {
      state.exercises.splice(helper.find(state, id), 1);
    },
    removeAllExercises(state) {
      state.exercises = [];
    },
  },
  actions: {
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
  },
};
