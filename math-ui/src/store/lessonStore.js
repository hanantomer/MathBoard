import dbSyncMixin from "../Mixins/dbSyncMixin";
import EditMode from "../Mixins/editMode";
import UserType from "../Mixins/userType";
import Vue from "vue";

const helper = {
  findLessonById: function (state, id) {
    return state.lessons.find((s) => s.id == id);
  },
};

export default {
  modules: {
    dbSyncMixin,
  },
  state: {
    lessons: [],
    currentLesson: {},
    operationMode: { editMode: EditMode.SYMBOL },
  },
  getters: {
    getCurrentEditMode: (state) => {
      return state.operationMode.editMode;
    },
    getLessons: (state) => {
      return state.lessons;
    },
    getCurrentLesson: (state) => {
      return state.currentLesson;
    },
    isTeacher(state, getters) {
      return getters.getUser?.userType === UserType.TEACHER;
    },
  },
  mutations: {
    addLesson(state, lesson) {
      if (state.lessons.indexOf(lesson) < 0) {
        state.lessons.push(lesson);
      }
      state.currentLesson = lesson;
    },
    setCurrentLesson(state, lesson) {
      state.currentLesson = lesson;
    },
    removeLesson(state, id) {
      state.lessons.splice(helper.findLessonById(state, id), 1);
    },
    removeAllLessons(state) {
      state.lessons = [];
    },
    setCurrentEditMode: function (state, editMode) {
      Vue.set(state.operationMode, "editMode", editMode);
    },
  },
  actions: {
    async loadLesson(context, LessonUUId) {
      let lesson = await dbSyncMixin.methods.getLesson(LessonUUId);
      if (!!lesson) {
        context.commit("addLesson", lesson);
        context.commit("setCurrentLesson", lesson);
      }
    },
    async loadLessons(context, isTeacher) {
      context.commit("removeAllLessons");
      let lessons = isTeacher
        ? await dbSyncMixin.methods.getTeacherLessons(
            context.getters.getUser.id
          )
        : await dbSyncMixin.methods.getStudentLessons(
            context.getters.getUser.id
          );

      if (lessons.data.length > 0) {
        lessons.data.forEach((e) => {
          context.commit("addLesson", e.Lesson ?? e);
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
    async addCurrentLessonToSharedLessons(context) {
      await dbSyncMixin.methods.addLessonToSharedLessons(
        context.getters.getCurrentLesson.uuid,
        context.getters.getUser.id
      );
      //context.commit("setCurrentLesson", payload);
    },
    setCurrentEditMode(context, editMode) {
      context.commit("setCurrentEditMode", editMode);
      console.debug("new mode:" + editMode);
    },

    removeLesson(context, payload) {
      context.commit("removeLesson", payload.id);
    },
  },
};
