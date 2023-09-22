import { defineStore } from "pinia";
import dbHelper from "../../helpers/dbHelper";
import { useUserStore } from "./userStore";
const db = dbHelper();
export const useLessonStore = defineStore("lesson", () => {
    let lessons = new Map();
    let currentLesson = {};
    function getCurrentLesson() {
        return currentLesson;
    }
    function getLessons() {
        return lessons;
    }
    async function loadLessons() {
        const userStore = useUserStore();
        //if (userStore.currentUser == undefined) return;
        let lessonsFromDB = userStore.isTeacher()
            ? await db.getTeacherLessons(userStore.getCurrentUser().uuid)
            : await db.getStudentLessons(userStore.getCurrentUser().uuid);
        lessonsFromDB.forEach((l) => {
            lessons.set(l.uuid, l);
        });
    }
    async function setCurrentLesson(lessonUUId) {
        // store might not be loaded yet
        if (!lessons.get(lessonUUId)) {
            await loadLessons();
        }
        if (!lessons.get(lessonUUId)) {
            throw TypeError("invalid lesson:" + lessonUUId);
        }
        currentLesson = lessons.get(lessonUUId);
    }
    async function addLesson(lessonName) {
        const userStore = useUserStore();
        let lesson = { name: lessonName, user: userStore.getCurrentUser() };
        let createdLesson = await db.addLesson(lesson);
        lessons.set(createdLesson.uuid, createdLesson);
        setCurrentLesson(createdLesson.uuid);
        return createdLesson;
    }
    async function addLessonToSharedLessons() {
        const userStore = useUserStore();
        await db.addLessonToSharedLessons(currentLesson.uuid, userStore.getCurrentUser().uuid);
    }
    function removeLesson(lessonUUId) {
        lessons.forEach((l) => {
            if (l.uuid === lessonUUId)
                lessons.delete(l.uuid);
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
//# sourceMappingURL=lessonStore.js.map