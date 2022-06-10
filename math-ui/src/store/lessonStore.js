import dbSyncMixin from "../Mixins/dbSyncMixin";

export default {
  modules: {
    dbSyncMixin,
  },
  state: {
    lessons: [],
    currentLesson: {},
  },
  getters: {
    getLessons: (state) => {
      return state.lessons;
    },
    getCurrentLesson: (state) => {
      return state.currentLesson;
    },
  },
  mutations: {
    addLesson(state, lesson) {
      state.lessons.push(lesson);
    },
    setCurrentLesson(state, lesson) {
      state.currentLesson = lesson;
    },
    removeLesson(state, id) {
      state.lessons.splice(helper.find(state, id), 1);
    },
    removeAllLessons(state) {
      state.lessons = [];
    },
  },
  actions: {
    async loadLesson(context, lessonId) {
      let lesson = await dbSyncMixin.methods.getLesson(lessonId);
      if (!!lesson) {
        context.commit("addLesson", lesson);
        context.commit("setCurrentLesson", lesson);
      }
    },
    async loadLessons(context) {
      context.commit("removeAllLessons");
      let lessons = await dbSyncMixin.methods.getLessons(
        context.getters.getUser
      );
      if (lessons.data.length > 0) {
        lessons.data.forEach((e) => {
          context.commit("addLesson", e);
        });
      }
      return lessons.data.length > 0;
    },
    addLesson(context, payload) {
      const lesson = payload;
      lesson.UserId = context.getters.getUser.id;
      return new Promise((resolve, reject) => {
        dbSyncMixin.methods
          .addLesson(lesson)
          .then((lesson) => {
            context.commit("addLesson", lesson.data);
            resolve(lesson.data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    setCurrentLesson(context, payload) {
      context.commit("setCurrentLesson", payload);
    },
    removeLesson(context, payload) {
      context.commit("removeLesson", payload.id);
    },
  },
};
