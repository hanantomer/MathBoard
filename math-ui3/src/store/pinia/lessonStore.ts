//  questions of current lesson
import Lesson from "../../../../math-db/src/models/lesson/lesson.model";
import { defineStore } from "pinia";
import dbHelper from "../../helpers/dbHelper";
import { useUserStore } from "./userStore";
const db = dbHelper();
const userStore = useUserStore();


export const useLessonStore = defineStore("lesson", () => {
  let lessons: Map<String, Lesson> = new Map();
  let currentLesson: Lesson = new Lesson();

  // async function loadCurrentLesson(): Promise<void> {
  //   currentLesson = await db.getLesson(LessonUUId);
  // }

  async function loadLessons() {
    let lessonsFromDB = userStore.isTeacher()
      ? await db.getTeacherLessons(userStore.currentUser?.uuid)
      : await db.getStudentLessons(userStore.currentUser?.uuid);

    lessonsFromDB.forEach((l: Lesson) => {
      lessons.set(l.uuid, l);
    });
  }

  async function setCurrentLesson(lessonUUId: string) {
    if (!lessons.get(lessonUUId)) {
      loadLessons();
    }
    if (lessons.get(lessonUUId)) {
      currentLesson = lessons.get(lessonUUId)!;
    }
  }

  async function addLesson(lesson: Lesson) : Promise<Lesson>{
    lesson = await db.addLesson(lesson);
    lessons.set(lesson.uuid, lesson);
    setCurrentLesson(lesson.uuid);
    return lesson;
  }

  async function addLessonToSharedLessons() {
    await db.addLessonToSharedLessons(
      currentLesson.uuid,
      userStore.currentUser.id
    );
  }



  function removeLesson(lessonUUId: string) {
    lessons.forEach((l: Lesson) => {
      if (l.uuid === lessonUUId) lessons.delete(l.uuid);
    });
  }

  return {
    lessons,
    currentLesson,
    loadLessons,
    setCurrentLesson,
    addLesson,
    addLessonToSharedLessons,
    removeLesson
  };
});
