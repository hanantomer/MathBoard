import "reflect-metadata";
import Lesson  from "./models/lesson/lesson.model"
import StudentLesson  from "./models/lesson/studentLesson.model";
import Question  from "./models/question/question.model";
import Answer  from "./models/answer/answer.model";
import User  from "./models/user.model";

import {
    BaseNotation, UserAttributes,  AnswerAttributes, AnswerCreateAttributes,
    QuestionAttributes, QuestionCreateAttributes, StudentLessonAttributes, StudentLessonCreateAttributes,
    LessonAttributes, LessonCreateAttributes 
} from "../../math-common/build/notationTypes";

import db from "./models/index";
import { capitalize } from "../../math-common/build/utils";


export default function dbUtil() {
    // utility

    async function getIdByUUId(
        model: string,
        uuid: string
    ): Promise<number | null> {
        let res = await db.sequelize.models[model].findOne({
            attributes: {
                include: ["id"],
            },
            where: {
                uuid: uuid,
            },
        });

        return res?.get("id") as number;
    }

    // user

    async function isTeacher(
        userUUId: string,
        lessonUUId: string
    ): Promise<boolean> {
        let lessonId = await getIdByUUId("Lesson", lessonUUId);
        if (!lessonId) return false;

        let userId = await getIdByUUId("User", userUUId);
        if (!userId) return false;

        let lesson = await Lesson.findByPk(lessonId);

        return lesson?.user.id === userId;
    }

    async function getUser(userUUId: string): Promise<User | null> {
        let userId = await getIdByUUId("User", userUUId);
        if (!userId) return null;

        return await User.findByPk(userId);
    }

    async function getUserByEmailAndPassword(
        email: string,
        password: string
    ): Promise<User | null> {
        return User.findOne({
            where: {
                email: email,
                password: password,
            },
        });
    }

    async function createUser(
        user: UserAttributes
    ): Promise<User> {
        return await User.create(user);
    }

    // lesson

    async function getLesson(
        lessonUUId: string
    ): Promise<Lesson | null> {
        let lessonId = await getIdByUUId("Lesson", lessonUUId);
        if (!lessonId) return null;

        return await Lesson.findByPk(lessonId);
    }

    async function getLessons(
        userUUId: string
    ): Promise<Lesson[] | null> {
        let userId = await getIdByUUId("User", userUUId);
        if (!userId) return null;
        return await Lesson.findAll({
            where: {
                user: {
                    id: userId,
                },
            },
        });
    }

    async function createLesson(
        lesson: LessonAttributes
    ): Promise<Lesson> {
        return await Lesson.create(lesson);
    }


    // student lesson

    async function getStudentLessons(
        lessonUUId: string
    ): Promise<StudentLesson[] | null> {
        let lessonId = await getIdByUUId("Lesson", lessonUUId);
        if (!lessonId) return null;
        return await StudentLesson.findAll({
            where: {
                lessonId: lessonId,
            },
        });
    }

    async function createStudentLesson(
        lesson: StudentLessonCreateAttributes
    ): Promise<StudentLesson> {
        return await StudentLesson.create(lesson);
    }

    // question

    async function getQuestion(
        questionUUId: string
    ): Promise<Question | null> {
        let questionId = await getIdByUUId("Question", questionUUId);
        if (!questionId) return null;

        return await Question.findByPk(questionId);
    }

    async function getQuestions(
        lessonUUId: string
    ): Promise<Question[] | null> {
        let lessonId = await getIdByUUId("Lesson", lessonUUId);
        if (!lessonId) return null;
        return await Question.findAll({
            where: {
                lessonId: lessonId,
            },
        });
    }

    async function createQuestion(
        question: QuestionAttributes
    ): Promise<Question> {
        return await Question.create(question);
    }

    // answer

    async function getAnswer(
        answerUUId: string
    ): Promise<AnswerAttributes | null> {
        let answerId = await getIdByUUId("Answer", answerUUId);
        if (!answerId) return null;
        return await Answer.findByPk(answerId) as AnswerAttributes | null;
    }

    async function getAnswers(questionUUId: string): Promise<Answer[] | null> {
        let questionId = await getIdByUUId("Question", questionUUId);
        if (!questionId) return null;
        return await Answer.findAll({
            where: {
                questionId: questionId,
            },
        });
    }

    async function createAnswer(
        answer: AnswerCreateAttributes
    ): Promise<Answer> {
        return await Answer.create(answer);
    }

    async function getUserAnswer(
        userUUId: string,
        questionUUId: string
    ): Promise<Answer | null> {
        let questionId = await getIdByUUId("Question", questionUUId);
        if (!questionId) return null;

        let userId = await getIdByUUId("User", userUUId);
        if (!userId) return null;

        return await Answer.findOne({
            where: {
                user: {
                    Id: userId,
                },
                question: {
                    Id: questionId,
                }
            },
        });
    }

    async function getNotations(
        boardType: String,
        notationType: String,
        parentUUId: string
    ) {
        const boardPrefix = boardType.toString().toLowerCase();
        const boardPrefixIdFieldName =
            boardType.toString().toLowerCase() + "Id";
        const boardPrefixCapitalized = capitalize(boardPrefix);
        const notationTypeSuffix = notationType.toString().toLowerCase();
        const notationTypeSuffixCapitalized = capitalize(notationTypeSuffix);
        const notationName =
            boardPrefixCapitalized + notationTypeSuffixCapitalized;

        let parentId = await getIdByUUId(boardPrefixCapitalized, parentUUId);
        if (!parentId) return null;

        return await db.sequelize.models[notationName].findAll({
            where: {
                [boardPrefixIdFieldName]: parentId,
            },
        });
    }

    async function createNotation(
        boardType: String,
        notationType: String,
        notation: BaseNotation
    ) {
        ///TODO : move to utility function
        const boardPrefix = boardType.toString().toLowerCase();
        const boardPrefixCapitalized = capitalize(boardPrefix);
        const notationTypeSuffix = notationType.toString().toLowerCase();
        const notationTypeSuffixCapitalized = capitalize(notationTypeSuffix);
        const notationName =
            boardPrefixCapitalized + notationTypeSuffixCapitalized;

        return await db.sequelize.models[notationName].create(notation as any);
    }

    return {
        getIdByUUId,
        isTeacher,
        getUser,
        getUserByEmailAndPassword,
        getUserAnswer,
        getLesson,
        getLessons,
        createLesson,
        getQuestion,
        getQuestions,
        createQuestion,
        getAnswer,
        getAnswers,
        createAnswer,
        getNotations,
        createNotation,
        getStudentLessons,
        createStudentLesson
    };
}
