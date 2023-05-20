//  questions of current lesson
import { defineStore } from "pinia";
import Lesson from "../../../../math-db/src/models/lesson/lesson.model";
import dbSync from "../../Mixins/dbSyncMixin";
import { EditMode } from "../../../../math-common/src/enum";
import { useUserStore } from "./userStore";

const db = dbSync();
const userStore = useUserStore();


// const helper = {
//   findLessonById: function (state, id) {
//     return state.lessons.find((s) => s.id == id);
//   },
// };


export const useLessonStore = defineStore("lesson", {
  state: () => ({
    lessons: <Lesson[]>[],
    currentLesson: <Lesson>{},
    editMode: EditMode.SYMBOL,
  }),
  getters: {
    getCurrentEditMode(state)  {
      return state.editMode;
    },
    getLessons(state) {
      return state.lessons;
    },
    getCurrentLesson(state) {
      return state.currentLesson;
    },
    //isTeacher: function() {  // does not belong here, take it from user store
    //  return getters.getUser?.userType === "teacher";
    //},
  },
  actions: {
    async loadLesson(LessonUUId: string) : Promise<Lesson|null> {
      let lessons: Lesson[] = (await db.getLesson(LessonUUId)).data;
      if (lessons) {
        this.currentLesson = lessons[0];
        return this.currentLesson;
      }
      return null;
    },
    async setCurrentLesson(lesson: Lesson) {
      this.currentLesson = lesson;
    },
    async loadLessons(isTeacher: boolean) {
      this.lessons = [];
      let lessons = isTeacher
        ? await db.getTeacherLessons(userStore.getUser.id)
        : await db.getStudentLessons(userStore.getUser.id);

      if (lessons.data.length > 0) {
        lessons.data.forEach((e: any) => {
          this.lessons.push(e.Lesson ?? e);
        });
      }
    },
    async addLesson(lesson: Lesson) {
      lesson.userId = userStore.getUser.id;
      lesson = await db.addLesson(lesson);
      this.lessons.push(lesson);
    },
    async addLessonToSharedLessons() {
      await db.addLessonToSharedLessons(
        this.getCurrentLesson.uuid,
        userStore.getUser.id
      );
    },
    setCurrentEditMode(editMode: EditMode) {
      this.editMode = editMode;
    },

    removeLesson(lessonUUId : string) {
      this.lessons.forEach((item: Lesson, index: number) => {
        if (item.uuid === lessonUUId) this.lessons.splice(index, 1);
      });
    },
  },
});
