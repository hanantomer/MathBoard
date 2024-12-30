import "reflect-metadata";
import Lesson  from "./models/lesson/lesson.model"
import StudentLesson  from "./models/lesson/studentLesson.model";
import Question  from "./models/question/question.model";
import Answer  from "./models/answer/answer.model";
import User from "./models/user.model";
import Color from "./models/color.model";
import db from "./models/index";

import {
    CurveNotationAttributes,
    ExponentNotationAttributes,
    NotationAttributes,
    PointNotationAttributes,
    RectNotationAttributes,
    SlopeLineNotationAttributes,
    VerticalLineNotationAttributes,
    SqrtNotationAttributes
} from "../../math-common/src/baseTypes";
import { UserAttributes, StudentLessonCreationAttributes} from "../../math-common/build/userTypes";
import { LessonCreationAttributes } from "../../math-common/src/lessonTypes";
import { QuestionCreationAttributes } from "../../math-common/build/questionTypes";
import { AnswerAttributes, AnswerCreationAttributes } from "../../math-common/build/answerTypes";
import { capitalize } from "../../math-common/build/utils";
import { BoardType, NotationType } from "../../math-common/src/unions";
import { Model, ModelCtor } from "sequelize";



let modelMap = new Map<string, ModelCtor<Model>>();

export default function dbUtil() {

    // find model with case insensetivity
    function findModel(modelName: string): ModelCtor<Model>{
        if (modelMap.size === 0) {
            for (let m in db.sequelize.models) {
                modelMap.set(m.toLowerCase(), db.sequelize.models[m]);
            }
        }

        return modelMap.get(modelName.toLowerCase())!;
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
                "$user.id$": userId,
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
            include: [{ model: Question, include: [{ model: Lesson }] },{ model: User }]
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

    async function getIdByUUId(
        model: string,
        uuid: string
    ): Promise<number | null> {

        

        if (!model) {
            throw new Error(`model: ${model} should not be null`);
        }

        if (!uuid) {
            throw new Error(`uuid for model: ${model} should not be null`);
        }

        let res = await findModel(model).findOne({
            attributes: {
                include: ["id"],
            },
            where: {
                uuid: uuid,
            },
        });

        return res?.get("id") as number;
    }

    async function getIdByColor(
        model: string,
        value: string 
    ): Promise<number | null> {
        if (!model) {
            throw new Error(`model: ${model} should not be null`);
        }

        if (!value) {
            throw new Error("color should not be null");
        }

        let res = await findModel("color").findOne({
            attributes: {
                include: ["id"],
            },
            where: {
                value: value,
            },
        });

        // add
        if (!res) {
            res = await findModel("color").create({ value: value });
        }

        return res?.get("id") as number;
    }

    async function getColorById(
        model: string,
        id: number
    ): Promise<string | null> {
        if (!model) {
            throw new Error(`model: ${model} should not be null`);
        }

        if (!id) {
            return null;
        }

        let res = await findModel(model).findOne({
            attributes: {
                include: ["value"],
            },
            where: {
                id: id,
            },
        });

        return res?.get("value") as string;
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
            ///TODO: report warning to log
            return null;
        }

        if (!findModel(modelName)) {
            ///TODO: report warning to log
            return null;
        }

        if (!db.sequelize.models[boardModelName]) {
            ///TODO: report warning to log
            return null;
        }

        let parentId = await getIdByUUId(boardModelName, parentUUId);
        if (!parentId) return null;

        return await findModel(modelName).findAll({
            where: {
                [boardFieldIdFieldName]: parentId,
            },
            include: [
                Color,
                User,
                db.sequelize.models[boardModelName],
            ],
        });
    }

    async function createNotation(
        boardType: String,
        notationType: String,
        notation: NotationAttributes
    ) {
        const modelName = getModelName(boardType, notationType); // e.g. LessonSymbol
        const boardName = boardType.toString().toLowerCase(); // e.g lesson
        const boardModelName = capitalize(boardName); // e.g Lesson

        if (!validateModel(notation)) {

            return;
        }

        (notation as any).userId = (await getIdByUUId(
            "User",
            notation.user.uuid
        )) as number;

        
        (notation as any)[boardName + "Id"] = (await getIdByUUId(
            boardModelName,
            notation.parentUUId
        )) as number;

        const res = await findModel(modelName).create(
            notation as any
        );

        return await findModel(modelName).findByPk(
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
        notation: NotationAttributes
    ) {
        const modelName = getModelName(boardType, notationType); // e.g. LessonSymbol
        const id = (await getIdByUUId(modelName, uuid)) as number;
        if (notation.color) {
            
            if (notation.color.id) {
                (notation as any).colorId = notation.color.id;
            }
            else { // new color
                (notation as any).colorId = (await getIdByColor(
                    "Color",
                    notation.color.value
                )) as number;
            }
        }

        notation.notationType = notationType;
        if (!id) return;
        if (!validateModel(notation)) {
            return;
        }

        // all keys but uuid
        const notationFiltered =
            Object.fromEntries(Object.entries(notation).filter((o) => o[0] != "uuid"));

        return await findModel(modelName).update(notationFiltered, {
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
        return await findModel(modelName).destroy({
            where: { id: id },
        });
    }

    function getModelName(boardType: String, notationType: String) {
        const boardName = boardType.toString().toLowerCase(); // e.g lesson
        const boardModelName = capitalize(boardName); // e.g Lesson
        const notationTypeName = notationType.toString().toLowerCase(); // e.g. symbol
        const notationTypeNameCapitalized = capitalize(notationTypeName); // e.g. Symbol
        const modelName = boardModelName + notationTypeNameCapitalized; // e.g. LessonSymbol
        return modelName;
    }

    function validateModel(model: NotationAttributes): boolean {

        if (!validateColAndRowRounded(model)) {
            throw new Error(JSON.stringify(model) + ": has a non rounded col or row");
        }
        
        switch (model.notationType) {
            case "TEXT":
            case "IMAGE": {
                const m = model as RectNotationAttributes;

                if (
                    !(
                        m.fromCol >= 0 &&
                        m.fromCol >= 0 &&
                        m.toCol >= 0 &&
                        m.toRow >= 0 &&
                        m.fromCol <= m.toCol
                    )
                ) {
                    throw new Error("invalid model:" + JSON.stringify(m));
                }
                break;
            }

            case "EXPONENT": {
                const m = model as ExponentNotationAttributes;

                if (
                    !(
                        (m.col ?? 0) >= 0 &&
                        (m.row ?? 0) >= 0 &&
                        (!m.exponent ||  m.exponent.toString().length > 0)
                    )
                ) {
                    throw new Error("invalid model:" + JSON.stringify(m));
                }
                break;
            }

            case "SIGN":
            case "SYMBOL": {
                const m = model as PointNotationAttributes;
                if (!((m.col ?? 0) >= 0 && (m.row ?? 0) >= 0)) {
                    throw new Error("invalid model:" + JSON.stringify(m));
                }
                break;
            }

            case "SQRT":
             {
                const m = model as SqrtNotationAttributes;
                if (
                    !(
                        m.fromCol >= 0 &&
                        m.toCol >= 0 &&
                        m.row >= 0 &&
                        m.fromCol < m.toCol
                    )
                ) {
                    throw new Error("invalid model:" + JSON.stringify(m));
                }
                break;
            }
            case "SLOPELINE": {
                const m = model as SlopeLineNotationAttributes;
                if (
                    !(
                        m.p1x >= 0 &&
                        m.p2x >= 0 &&
                        m.p1x < m.p2x &&
                        m.p1y >= 0 &&
                        m.p2y >= 0 &&
                        m.p2x != m.p1x &&
                        m.p1y != m.p2y
                    )
                ) {
                    throw new Error("invalid model:" + JSON.stringify(m));
                }
                break;
            }
            case "VERTICALLINE": {
                const m = model as VerticalLineNotationAttributes;
                if (
                    !(
                        m.px >= 0 &&
                        m.p1y >= 0 &&
                        m.p2y >= 0 &&
                        m.p1y < m.p2y
                    )
                ) {
                    throw new Error("invalid model:" + JSON.stringify(m));
                }
                break;
            }

            case "CONCAVECURVE":
            case "CONVEXCURVE": {
                const m = model as CurveNotationAttributes;

                if (!(m.p1x > 0 && m.p1y > 0 && m.p2x > 0 && m.p2y >= 0)) {
                    throw new Error("invalid model:" + JSON.stringify(m));
                }
                break;
            }
        }

        return true;
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

function validateColAndRowRounded(model: NotationAttributes) : boolean {
    
    const m = model as RectNotationAttributes & ExponentNotationAttributes & PointNotationAttributes;
    
    if (m.col && !Number.isSafeInteger(m.col)) return false;
    if (m.row && !Number.isSafeInteger(m.row)) return false;
    if (m.fromCol && !Number.isSafeInteger(m.fromCol)) return false;
    if (m.toCol && !Number.isSafeInteger(m.toCol)) return false;

    return true;
}

