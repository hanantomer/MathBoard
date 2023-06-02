//  questions of current lesson
import { defineStore } from "pinia";
import Lesson from "../../../../math-db/src/models/lesson/lesson.model";
import { dbSync } from "../../Mixins/dbSyncMixin";
import { EditMode } from "../../../../math-common/src/enum";
import { useUserStore } from "./userStore";
import { NotationTypeShape } from "../../../../math-common/src/enum";

const db = dbSync();
const userStore = useUserStore();


export const useLessonStore = defineStore("lesson", {
  state: () => ({
    lessons: <Map<String, Lesson>>{},
    currentLesson: <Lesson>{},
    editMode: EditMode.SYMBOL,
  }),
  getters: {
    getCurrentEditMode(state) {
      return state.editMode;
    },
    getLessons(state) {
      return state.lessons;
    },
    getCurrentLesson(state) {
      return state.currentLesson;
    },
  },
  actions: {

    async loadLesson(LessonUUId: string): Promise<void> {
      this.currentLesson = (await db.getLesson(LessonUUId));
    },

    async setCurrentLesson(lesson: Lesson) {
      this.currentLesson = lesson;
    },

    async loadLessons(isTeacher: boolean) {

      this.lessons = <Map<String, Lesson>>{};

      let lessons = isTeacher
        ? await db.getTeacherLessons(userStore.getCurrentUser.id)
        : await db.getStudentLessons(userStore.getCurrentUser.id);

      lessons.forEach((l: Lesson) => {
        this.lessons.set(l.uuid, l);
      });
    },

    async addLesson(lesson: Lesson) {
      lesson = await db.addLesson(lesson);
      this.lessons.set(lesson.uuid, lesson)
    },

    async addLessonToSharedLessons() {
      await db.addLessonToSharedLessons(
        this.getCurrentLesson.uuid,
        userStore.getCurrentUser.id
      );
    },

    setCurrentEditMode(editMode: EditMode) {
      this.editMode = editMode;
    },

    removeLesson(lessonUUId: string) {
      this.lessons.forEach((l: Lesson) => {
        if (l.uuid === lessonUUId) this.lessons.delete(l.uuid);
      });
    },
  },
});
