//  questions of current lesson
import { LessonAttributes, LessonCreateAttributes } from "../../../../math-db/src/models/lesson/lesson.model";
import { defineStore } from "pinia";
import dbHelper from "../../helpers/dbHelper";
import { useUserStore } from "./userStore";
const db = dbHelper();
const userStore = useUserStore();


export const useLessonStore = defineStore("lesson", () => {
  let lessons: Map<String, LessonAttributes> = new Map();
  let currentLesson = <LessonAttributes>{};

  // async function loadCurrentLesson(): Promise<void> {
  //   currentLesson = await db.getLesson(LessonUUId);
  // }

  async function loadLessons() {
    if (userStore.currentUser == undefined) return;
    let lessonsFromDB = userStore.isTeacher()
      ? await db.getTeacherLessons(userStore.currentUser.uuid)
      : await db.getStudentLessons(userStore.currentUser.uuid);

    lessonsFromDB.forEach((l: LessonAttributes) => {
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

  async function addLesson(
    lesson: LessonCreateAttributes
  ): Promise<LessonAttributes> {
    let createdLesson = await db.addLesson(lesson);
    lessons.set(lesson.uuid, createdLesson);
    setCurrentLesson(createdLesson.uuid);
    return createdLesson;
  }

  async function addLessonToSharedLessons() {
    await db.addLessonToSharedLessons(
      currentLesson.uuid,
      userStore.currentUser!.uuid
    );
  }



  function removeLesson(lessonUUId: string) {
    lessons.forEach((l: LessonAttributes) => {
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
