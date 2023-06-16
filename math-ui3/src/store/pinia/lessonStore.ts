//  questions of current lesson
import Lesson from "../../../../math-db/src/models/lesson/lesson.model";
import { defineStore } from "pinia";
import { dbSync } from "../../Helpers/dbSyncMixin";
import { useUserStore } from "./userStore";
const db = dbSync();
const userStore = useUserStore();


export const useLessonStore = defineStore("lesson", () => {
  let lessons: Map<String, Lesson>  = new Map();
  let currentLesson: Lesson = new Lesson();


  async function loadLesson(LessonUUId: string): Promise<void> {
    this.currentLesson = await db.getLesson(LessonUUId);
  }

  async function loadLessons(isTeacher: boolean) {
    this.lessons = <Map<String, Lesson>>{};

    let lessons = isTeacher
      ? await db.getTeacherLessons(userStore.currentUser?.uuid)
      : await db.getStudentLessons(userStore.currentUser?.uuid);

    lessons.forEach((l: Lesson) => {
      this.lessons.set(l.uuid, l);
    });
  }

  async function setCurrentLesson(lesson: Lesson) {
    this.currentLesson = lesson;
  }

  async function addLesson(lesson: Lesson) {
    lesson = await db.addLesson(lesson);
    this.lessons.set(lesson.uuid, lesson);
  }

  async function addLessonToSharedLessons() {
    await db.addLessonToSharedLessons(
      this.getCurrentLesson.uuid,
      userStore.currentUser.id
    );
  }



  function removeLesson(lessonUUId: string) {
    this.lessons.forEach((l: Lesson) => {
      if (l.uuid === lessonUUId) this.lessons.delete(l.uuid);
    });
  }

  return {
    lessons,
    currentLesson,
    loadLesson,
    loadLessons,
    setCurrentLesson,
    addLesson,
    addLessonToSharedLessons,
    removeLesson
  };
});
