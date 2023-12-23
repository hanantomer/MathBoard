//  questions of current lesson
import { LessonAttributes, LessonCreationAttributes } from "common/lessonTypes";
import { defineStore } from "pinia";
import dbHelper from "../../helpers/dbHelper";
import { useUserStore } from "./userStore";
import { ref } from "vue";
import { StudentLessonCreationAttributes } from "common/userTypes";
const db = dbHelper();

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
    let lessonFromDB = null;

    lessonFromDB = await db.getLesson(lessonUUId);

    if (!lessonFromDB) {
      throw new Error(`lesson ${lessonUUId} does not exists`);
    }

    lessons.value.set(lessonFromDB.uuid, lessonFromDB);
  }

  async function loadLessons() {
    const userStore = useUserStore();
    let lessonsFromDB = null;
    let userUUId = userStore.getCurrentUser()!.uuid;

    if (userStore.isTeacher())
      lessonsFromDB = await db.getTeacherLessons(userUUId);
    else lessonsFromDB = await db.getStudentLessons(userUUId);

    lessonsFromDB.forEach((l: LessonAttributes) => {
      lessons.value.set(l.uuid, l);
    });
  }

  async function setCurrentLesson(lessonUUId: string) {
    if (!lessons.value.get(lessonUUId)) {
      await loadLesson(lessonUUId);
    }
    currentLesson.value = lessons.value.get(lessonUUId)!;
  }

  async function addLesson(lessonName: string): Promise<LessonAttributes> {
    const userStore = useUserStore();
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

  return {
    getLessons,
    getCurrentLesson,
    loadLesson,
    loadLessons,
    setCurrentLesson,
    addLesson,
    addLessonToSharedLessons,
    removeLesson,
  };
});
