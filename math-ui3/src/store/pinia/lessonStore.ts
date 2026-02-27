//  questions of current lesson
import { LessonAttributes, LessonCreationAttributes } from "common/lessonTypes";
import { defineStore } from "pinia";
import apiHelper from "../../helpers/apiHelper";
import { useUserStore } from "./userStore";
import { ref } from "vue";
import {
  StudentLessonAttributes,
  StudentLessonCreationAttributes,
} from "common/userTypes";

export const useLessonStore = defineStore("lesson", () => {
  let lessons = ref<Map<String, LessonAttributes>>(new Map());
  let currentLesson = ref<LessonAttributes>();

  function getCurrentLesson() {
    return currentLesson.value;
  }

  function getLessons() {
    return lessons.value;
  }

  async function loadLesson(lessonUUId: string) {
    const db = apiHelper();
    let lesson = await db.getLesson(lessonUUId);

    if (!lesson) {
      throw new Error(`lesson ${lessonUUId} does not exists`);
    }

    lessons.value.set(lesson.uuid, lesson);
  }

  async function loadLessons() {
    clearLessons();
    const userStore = useUserStore();
    let userUUId = userStore.getCurrentUser()!.uuid;

    const db = apiHelper();
    if (userStore.isTeacher()) {
      const lessonsFromDB = await db.getTeacherLessons(userUUId);
      if (!lessonsFromDB) return;
      lessonsFromDB.forEach((l: LessonAttributes) => {
        lessons.value.set(l.uuid, l);
      });
    } else {
      const studentLessonsFromDB = await db.getStudentLessons(userUUId);
      if (!studentLessonsFromDB) return;
      studentLessonsFromDB.forEach((sl: StudentLessonAttributes) => {
        lessons.value.set(sl.lesson.uuid, sl.lesson);
      });
    }
  }

  async function setCurrentLesson(lessonUUId: string) {
    currentLesson.value = lessons.value.get(lessonUUId);
  }

  async function addLesson(lessonName: string): Promise<LessonAttributes> {
    const userStore = useUserStore();
    const db = apiHelper();
    const lesson: LessonCreationAttributes = {
      name: lessonName,
      user: userStore.getCurrentUser()!,
    };
    let createdLesson = await db.addLesson(lesson);
    lessons.value.set(createdLesson.uuid, createdLesson);
    setCurrentLesson(createdLesson.uuid);
    return createdLesson;
  }

  async function addLessonToSharedLessons() {
    const userStore = useUserStore();
    const db = apiHelper();
    let studentLesson: StudentLessonCreationAttributes = {
      user: userStore.getCurrentUser()!,
      lesson: currentLesson.value!,
    };

    await db.addLessonToSharedLessons(studentLesson);
  }

  function removeLesson(lessonUUId: string) {
    lessons.value.forEach((l: LessonAttributes) => {
      if (l.uuid === lessonUUId) lessons.value.delete(l.uuid);
    });
  }

  function clearLessons() {
    lessons.value.clear();
  }

  return {
    getLessons,
    getCurrentLesson,
    loadLesson,
    loadLessons,
    setCurrentLesson,
    addLesson,
    addLessonToSharedLessons,
    removeLesson,
    clearLessons,
  };
});
