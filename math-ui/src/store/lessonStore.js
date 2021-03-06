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
    async addLesson(context, lesson) {
      lesson.UserId = context.getters.getUser.id;
      lesson = await dbSyncMixin.methods.addLesson(lesson);
      context.commit("addLesson", lesson.data);
      return lesson.data;
    },
    setCurrentLesson(context, payload) {
      context.commit("setCurrentLesson", payload);
    },
    removeLesson(context, payload) {
      context.commit("removeLesson", payload.id);
    },
  },
};
