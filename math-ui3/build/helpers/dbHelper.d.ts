import { BoardType, NotationType } from "common/unions";
import { NotationAttributes, NotationCreationAttributes } from "common/baseTypes";
import { UserAttributes, UserCreationAttributes } from "common/userTypes";
import { LessonAttributes, LessonCreationAttributes } from "common/lessonTypes";
import { QuestionAttributes, QuestionCreateAttributes } from "common/questionTypes";
import { AnswerAttributes, AnswerCreateAttributes } from "common/answerTypes";
export default function useDbHelper(): {
    getNotations: <T extends NotationAttributes>(notationType: NotationType, boardType: BoardType, parentUUId: string) => Promise<T[]>;
    getAnswers: (questionUUId: string) => Promise<AnswerAttributes[]>;
    getQuestions: (lessonUUId: string) => Promise<QuestionAttributes[]>;
    getStudentLessons: (userUUId: string) => Promise<LessonAttributes[]>;
    getTeacherLessons: (userUUId: string) => Promise<LessonAttributes[]>;
    getAnswer: (answerUUId: string) => Promise<AnswerAttributes>;
    getQuestion: (questionUUId: string) => Promise<QuestionAttributes>;
    getLesson: (LessonUUId: string) => Promise<LessonAttributes>;
    authGoogleUser: () => Promise<UserAttributes>;
    authLocalUserByToken: () => Promise<UserAttributes | undefined>;
    authLocalUserByPassword: (email: string, password: string) => Promise<UserAttributes | null>;
    registerUser: (user: UserCreationAttributes) => Promise<UserAttributes>;
    addLesson: (lesson: LessonCreationAttributes) => Promise<LessonAttributes>;
    addLessonToSharedLessons: (lessonUUId: string, userUUId: string) => Promise<void>;
    addQuestion: (question: QuestionCreateAttributes) => Promise<QuestionAttributes>;
    addAnswer: (answer: AnswerCreateAttributes) => Promise<AnswerAttributes>;
    addNotation: (notation: NotationCreationAttributes) => Promise<NotationAttributes>;
    updateNotation: (notation: NotationAttributes & {
        uuid: string;
    }) => Promise<NotationAttributes>;
    removeNotation: (notation: NotationAttributes) => Promise<void>;
};
