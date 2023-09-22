//  questions of current lesson
import {
  LessonAttributes,
  LessonCreateAttributes,
} from "common/lessonTypes";
import { defineStore } from "pinia";
import dbHelper from "../../helpers/dbHelper";
import { useUserStore } from "./userStore";
const db = dbHelper();



export const useLessonStore = defineStore("lesson", () => {
  let lessons: Map<String, LessonAttributes> = new Map();
  let currentLesson = <LessonAttributes>{};

  function getCurrentLesson() {
    return currentLesson;
  }

  function getLessons() {
    return lessons;
  }

  async function loadLessons() {
    const userStore = useUserStore();
    let lessonsFromDB = null;

    if (userStore.isTeacher())
      lessonsFromDB = await db.getTeacherLessons(userStore.getCurrentUser().uuid);
    else
      lessonsFromDB = await db.getStudentLessons(userStore.getCurrentUser().uuid );

    lessonsFromDB.forEach((l: LessonAttributes) => {
      lessons.set(l.uuid, l);
    });
  }

  async function setCurrentLesson(lessonUUId: string) {
    // store might not be loaded yet
    if (!lessons.get(lessonUUId)) {
      await loadLessons();
    }

    if (!lessons.get(lessonUUId)) {
      throw TypeError("invalid lesson:" + lessonUUId)
    }
    currentLesson = lessons.get(lessonUUId)!;
  }

  async function addLesson(
    lessonName: string
  ): Promise<LessonAttributes> {
    const userStore = useUserStore();
    let lesson: LessonCreateAttributes = {name: lessonName, user: userStore.getCurrentUser()};
    let createdLesson = await db.addLesson(lesson);
    lessons.set(createdLesson.uuid, createdLesson);
    await setCurrentLesson(createdLesson.uuid);
    return createdLesson;
  }

  async function addLessonToSharedLessons() {
    const userStore = useUserStore();
    await db.addLessonToSharedLessons(
      currentLesson.uuid,
      userStore.getCurrentUser().uuid
    );
  }

  function removeLesson(lessonUUId: string) {
    lessons.forEach((l: LessonAttributes) => {
      if (l.uuid === lessonUUId) lessons.delete(l.uuid);
    });
  }

  return {
    getLessons,
    getCurrentLesson,
    loadLessons,
    setCurrentLesson,
    addLesson,
    addLessonToSharedLessons,
    removeLesson
  };
});
