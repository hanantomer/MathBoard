import { LessonAttributes } from "common/lessonTypes";
export declare const useLessonStore: import("pinia").StoreDefinition<"lesson", import("pinia")._UnwrapAll<Pick<{
    getLessons: () => Map<String, LessonAttributes>;
    getCurrentLesson: () => LessonAttributes;
    loadLessons: () => Promise<void>;
    setCurrentLesson: (lessonUUId: string) => Promise<void>;
    addLesson: (lessonName: string) => Promise<LessonAttributes>;
    addLessonToSharedLessons: () => Promise<void>;
    removeLesson: (lessonUUId: string) => void;
}, never>>, Pick<{
    getLessons: () => Map<String, LessonAttributes>;
    getCurrentLesson: () => LessonAttributes;
    loadLessons: () => Promise<void>;
    setCurrentLesson: (lessonUUId: string) => Promise<void>;
    addLesson: (lessonName: string) => Promise<LessonAttributes>;
    addLessonToSharedLessons: () => Promise<void>;
    removeLesson: (lessonUUId: string) => void;
}, never>, Pick<{
    getLessons: () => Map<String, LessonAttributes>;
    getCurrentLesson: () => LessonAttributes;
    loadLessons: () => Promise<void>;
    setCurrentLesson: (lessonUUId: string) => Promise<void>;
    addLesson: (lessonName: string) => Promise<LessonAttributes>;
    addLessonToSharedLessons: () => Promise<void>;
    removeLesson: (lessonUUId: string) => void;
}, "getLessons" | "getCurrentLesson" | "loadLessons" | "setCurrentLesson" | "addLesson" | "addLessonToSharedLessons" | "removeLesson">>;
