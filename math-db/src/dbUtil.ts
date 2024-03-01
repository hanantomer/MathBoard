import "reflect-metadata";
import Lesson  from "./models/lesson/lesson.model"
import StudentLesson  from "./models/lesson/studentLesson.model";
import Question  from "./models/question/question.model";
import Answer  from "./models/answer/answer.model";
import User from "./models/user.model";
import db from "./models/index";

import { NotationAttributes } from "../../math-common/src/baseTypes";
import { UserAttributes, StudentLessonCreationAttributes} from "../../math-common/build/userTypes";
import { LessonCreationAttributes } from "../../math-common/src/lessonTypes";
import { QuestionCreationAttributes } from "../../math-common/build/questionTypes";
import { AnswerAttributes, AnswerCreationAttributes } from "../../math-common/build/answerTypes";
import { capitalize } from "../../math-common/build/utils";
import { BoardType, NotationType } from "../../math-common/src/unions";


export default function dbUtil() {

    async function getIdByUUId(
        model: string,
        uuid: string
    ): Promise<number | null> {
        if (!model) {
            throw new Error(`model: ${model} must not be null`);
        }

        if (!uuid) {
            throw new Error(`uuid for model: ${model} must not be null`);
        }


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

    async function getUser(uuid: string): Promise<User | null> {
        let userId = await getIdByUUId("User", uuid);
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

    async function createUser(user: UserAttributes): Promise<User> {
        return await User.create(user);
    }

    // lesson

    async function getLesson(lessonUUId: string): Promise<Lesson | null> {
        let lessonId = await getIdByUUId("Lesson", lessonUUId);
        if (!lessonId) return null;

        return await Lesson.findByPk(lessonId);
    }

    async function getLessons(userUUId: string): Promise<Lesson[] | null> {
        let userId = await getIdByUUId("User", userUUId);
        if (!userId) return null;
        return await Lesson.findAll({
            include: [{ model: User }],
            where: {
                "$user.id$": 1,
            },
        });
    }

    async function createLesson(
        lesson: LessonCreationAttributes
    ): Promise<Lesson> {
        (lesson as any).userId = (await getIdByUUId(
            "User",
            lesson.user.uuid
        )) as number;
        return await Lesson.create(lesson);
    }

    // student lesson

    async function getStudentLesson(
        userUUId: string,
        lessonUUId: string
    ): Promise<StudentLesson | null> {
        let userId = await getIdByUUId("User", userUUId);
        if (!userId) return null;
        let lessonId = await getIdByUUId("Lesson", lessonUUId);
        if (!lessonId) return null;
        
        return await StudentLesson.findOne({
            include: [{ model: User }, {model: Lesson}],
            where: {
                "$user.id$": userId,
                "$lesson.id$": lessonId,
            },
        });
    }

    // student lessons

    async function getStudentLessons(
        userUUId: string
    ): Promise<StudentLesson[] | null> {
        let userId = await getIdByUUId("User", userUUId);
        if (!userId) return null;
        return await StudentLesson.findAll({
            include: [{ model: User }, {model: Lesson}],
            where: {
                "$user.id$": userId,
            },
        });
    }

    // connect user to lesson
    async function createStudentLesson(
        studentLesson: StudentLessonCreationAttributes
    ): Promise<StudentLesson> {

        (studentLesson as any).userId = (await getIdByUUId(
            "User",
            studentLesson.user.uuid
        )) as number;

        (studentLesson as any).lessonId = (await getIdByUUId(
            "Lesson",
            studentLesson.lesson.uuid
        )) as number;

        return await StudentLesson.create(studentLesson);
    }

    // question

    async function getQuestion(questionUUId: string): Promise<Question | null> {
        let questionId = await getIdByUUId("Question", questionUUId);
        if (!questionId) return null;

        return await Question.findByPk(questionId, {
            include: { all: true },
        });
    }

    async function getQuestions(
        lessonUUId: string
    ): Promise<Question[] | null> {
        let lessonId = await getIdByUUId("Lesson", lessonUUId);
        if (!lessonId) return null;
        return await Question.findAll({
            include: {
                model: Lesson,
                attributes: ["uuid", "name"],
            },
            where: {
                "$lesson.id$": lessonId,
            },
        });
    }

    async function createQuestion(
        question: QuestionCreationAttributes
    ): Promise<Question> {
        (question as any).lessonId = await getIdByUUId(
            "Lesson",
            question.lesson.uuid
        );
        (question as any).userId = await getIdByUUId(
            "User",
            question.user.uuid
        );
        return await Question.create(question);
    }

    // answer

    async function getAnswer(
        answerUUId: string
    ): Promise<AnswerAttributes | null> {
        let answerId = await getIdByUUId("Answer", answerUUId);
        if (!answerId) return null;
        const answer = (await Answer.findByPk(answerId, {
            include: [{ model: Question },{ model: User }]
        })) as AnswerAttributes | null;

        return answer;
    }

    async function getAnswers(questionUUId: string): Promise<Answer[] | null> {
        let questionId = await getIdByUUId("Question", questionUUId);
        if (!questionId) return null;
        return await Answer.findAll({
            include: [
                { model: Question, include: [{ model: Lesson }] },
                { model: User },
            ],
            where: {
                "$question.id$": questionId,
            },
        });
    }

    async function createAnswer(
        answer: AnswerCreationAttributes
    ): Promise<Answer> {

        (answer as any).questionId = await getIdByUUId("Question", answer.question.uuid );
        (answer as any).userId = await getIdByUUId("User", answer.user.uuid);

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
                },
            },
        });
    }

    async function getNotations(
        boardType: String,
        notationType: String,
        parentUUId: string
    ) {

        const boardName = boardType.toString().toLowerCase(); // e.g lesson
        const boardFieldIdFieldName = boardType.toString().toLowerCase() + "Id";
        const boardModelName = capitalize(boardName); // e.g Lesson
        const notationTypeName = notationType.toString().toLowerCase(); // e.g. symbol
        const notationTypeNameCapitalized = capitalize(notationTypeName); // e.g. Symbol
        const modelName = boardModelName + notationTypeNameCapitalized; // e.g. LessonSymbol

        if (!parentUUId) {
            ///TODE: report warning to log
            return null;
        }

        if (!db.sequelize.models[modelName]) {
            ///TODE: report warning to log
            return null;
        }

        if (!db.sequelize.models[boardModelName]) {
            ///TODE: report warning to log
            return null;
        }

        let parentId = await getIdByUUId(boardModelName, parentUUId);
        if (!parentId) return null;

        return await db.sequelize.models[modelName].findAll({
            where: {
                [boardFieldIdFieldName]: parentId,
            },
            include: [
                User,
                db.sequelize.models[boardModelName],
            ],
        });
    }

    /// TODO: use getModelName and reduce boilerplate
    async function createNotation(
        boardType: String,
        notationType: String,
        notation: NotationAttributes
    ) {
        const boardName = boardType.toString().toLowerCase(); // e.g lesson
        const boardModelName = capitalize(boardName); // e.g Lesson
        const notationTypeName = notationType.toString().toLowerCase(); // e.g. symbol
        const notationTypeNameCapitalized = capitalize(notationTypeName); // e.g. Symbol
        const modelName = boardModelName + notationTypeNameCapitalized; // e.g. LessonSymbol

        (notation as any).userId = (await getIdByUUId(
            "User",
            notation.user.uuid
        )) as number;

        (notation as any)[boardName + "Id"] = (await getIdByUUId(
            boardModelName,
            notation.parentUUId
        )) as number;

        const res = await db.sequelize.models[modelName].create(
            notation as any
        );

        return await db.sequelize.models[modelName].findByPk(
            res.dataValues.id,
            {
                include: [
                    User,
                    db.sequelize.models[boardModelName],
                ] /*e.g. include Lesson*/,
            }
        );
    }

    async function updateNotation(
        boardType: BoardType,
        notationType: NotationType,
        uuid: string,
        attributes: Object
    ) {
        const modelName = getModelName(boardType, notationType); // e.g. LessonSymbol
        const id = (await getIdByUUId(modelName, uuid)) as number;
        if (!id) return;
        return await db.sequelize.models[modelName].update(attributes, {
            where: { id: id },
            logging: true,
        });
    }

    async function deleteNotation(
        boardType: BoardType,
        notationType: NotationType,
        uuid: string
    ) {
        const modelName = getModelName(boardType, notationType); // e.g. LessonSymbol
        const id = (await getIdByUUId(modelName, uuid)) as number;
        return await db.sequelize.models[modelName].destroy({
            where: { id: id },
        });
    }

    function getModelName(boardType: string, notationType: string) {
        const boardName = boardType.toString().toLowerCase(); // e.g lesson
        const boardModelName = capitalize(boardName); // e.g Lesson
        const notationTypeName = notationType.toString().toLowerCase(); // e.g. symbol
        const notationTypeNameCapitalized = capitalize(notationTypeName); // e.g. Symbol
        const modelName = boardModelName + notationTypeNameCapitalized; // e.g. LessonSymbol
        return modelName;
    }


    return {
        getIdByUUId,
        getUser,
        createUser,
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
        getStudentLesson,
        getStudentLessons,
        createStudentLesson,
        updateNotation,
        deleteNotation,
    };
}
