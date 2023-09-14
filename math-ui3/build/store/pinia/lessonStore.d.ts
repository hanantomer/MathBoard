import { LessonAttributes, LessonCreateAttributes } from "common/notationTypes";
export declare const useLessonStore: import("pinia").StoreDefinition<"lesson", import("pinia")._UnwrapAll<Pick<{
    lessons: Map<String, LessonAttributes>;
    currentLesson: LessonAttributes;
    loadLessons: () => Promise<void>;
    setCurrentLesson: (lessonUUId: string) => Promise<void>;
    addLesson: (lesson: LessonCreateAttributes) => Promise<LessonAttributes>;
    addLessonToSharedLessons: () => Promise<void>;
    removeLesson: (lessonUUId: string) => void;
}, "lessons" | "currentLesson">>, Pick<{
    lessons: Map<String, LessonAttributes>;
    currentLesson: LessonAttributes;
    loadLessons: () => Promise<void>;
    setCurrentLesson: (lessonUUId: string) => Promise<void>;
    addLesson: (lesson: LessonCreateAttributes) => Promise<LessonAttributes>;
    addLessonToSharedLessons: () => Promise<void>;
    removeLesson: (lessonUUId: string) => void;
}, never>, Pick<{
    lessons: Map<String, LessonAttributes>;
    currentLesson: LessonAttributes;
    loadLessons: () => Promise<void>;
    setCurrentLesson: (lessonUUId: string) => Promise<void>;
    addLesson: (lesson: LessonCreateAttributes) => Promise<LessonAttributes>;
    addLessonToSharedLessons: () => Promise<void>;
    removeLesson: (lessonUUId: string) => void;
}, "loadLessons" | "setCurrentLesson" | "addLesson" | "addLessonToSharedLessons" | "removeLesson">>;
