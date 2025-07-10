import winston from 'winston';
import "reflect-metadata";
import Lesson  from "./models/lesson/lesson.model"
import StudentLesson  from "./models/lesson/studentLesson.model";
import Question  from "./models/question/question.model";
import Answer  from "./models/answer/answer.model";
import User from "./models/user.model";
import Color from "./models/color.model";
import db from "./models/index";
import path from "path";

import {
    CurveNotationAttributes,
    NotationAttributes,
    PointNotationAttributes,
    RectNotationAttributes,
    LineNotationAttributes,
    SqrtNotationAttributes
} from "../../math-common/src/baseTypes";
import { UserAttributes, StudentLessonCreationAttributes} from "../../math-common/build/userTypes";
import { LessonCreationAttributes } from "../../math-common/src/lessonTypes";
import { QuestionCreationAttributes } from "../../math-common/build/questionTypes";
import { AnswerAttributes, AnswerCreationAttributes } from "../../math-common/build/answerTypes";
import { capitalize } from "../../math-common/build/utils";
import { BoardType, NotationType, BoardTypeValues, NotationTypeValues, } from "../../math-common/build/unions";
import { Model, ModelCtor } from "sequelize";



const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: path.join(__dirname, "logs", "db.log")
        })
    ]
});

let modelMap = new Map<string, ModelCtor<Model>>();

let modelByUrlMap = new Map<string, ModelCtor<Model>>();


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

    function getModelNameByUrl(url: string) {

        if (!modelByUrlMap.has(url)) {
            const boardType = BoardTypeValues.filter(f => url.toUpperCase().indexOf(f) > -1)[0] as BoardType;
            const notationType = NotationTypeValues.filter(f => url.toUpperCase().indexOf(f) > -1)[0] as NotationType;
            const modelName = getModelName(boardType, notationType);
            modelByUrlMap.set(url, findModel(modelName));
        }

        return modelByUrlMap.get(url)!;
    }


    
    // user

    async function getUser(uuid: string): Promise<User | null> {
        try {
            let userId;
            try {
                userId = await getIdByUUId("User", uuid);
            } catch (error) {
                logger.error(`Failed to get user ID: ${error}`);
                throw error;
            }

            if (!userId) {
                logger.warn(`User not found for UUID: ${uuid}`);
                return null;
            }

            try {
                const user = await User.findByPk(userId);
                return user;
            } catch (error) {
                logger.error(`Failed to find user by ID: ${error}`);
                throw error;
            }
        } catch (error) {
            logger.error(`Error in getUser: ${error}`);
            throw error;
        }
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

    async function getResetToken(
        token: string,
    ): Promise<String | null> {
        const user = await User.findOne({
            where: {
                reset_pasword_token: token,
            },
        });
        return user?.reset_pasword_token || null;
    }


    async function getUserByEmail(
        email: string,
    ): Promise<User | null> {
        return User.findOne({
            where: {
                email: email,
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
        try {
            let userId;
            try {
                userId = await getIdByUUId("User", lesson.user.uuid);
                (lesson as any).userId = userId;
            } catch (error) {
                logger.error(`Failed to get user ID: ${error}`);
                throw error;
            }

            try {
                const newLesson = await Lesson.create(lesson);
                logger.info(`Created new lesson with ID: ${newLesson.id}`);
                return newLesson;
            } catch (error) {
                logger.error(`Failed to create lesson: ${error}`);
                throw error;
            }
        } catch (error) {
            logger.error(`Error in createLesson: ${error}`);
            throw error;
        }
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
        try {
            if (!model) {
                throw new Error(`model: ${model} should not be null`);
            }

            if (!value) {
                throw new Error("color should not be null");
            }

            let res;
            try {
                res = await findModel("color").findOne({
                    attributes: {
                        include: ["id"],
                    },
                    where: {
                        value: value,
                    },
                });
            } catch (error) {
                logger.error(`Failed to find color: ${error}`);
                throw error;
            }

            if (!res) {
                try {
                    res = await findModel("color").create({ value: value });
                    logger.info(`Created new color with value: ${value}`);
                } catch (error) {
                    logger.error(`Failed to create color: ${error}`);
                    throw error;
                }
            }

            return res?.get("id") as number;
        } catch (error) {
            logger.error(`Error in getIdByColor: ${error}`);
            throw error;
        }
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
        try {
            logger.info(`Getting notations for ${boardType} ${notationType} with parent UUID: ${parentUUId}`);

            const boardName = boardType.toString().toLowerCase();
            const boardFieldIdFieldName = boardType.toString().toLowerCase() + "Id";
            const boardModelName = capitalize(boardName);
            const notationTypeName = notationType.toString().toLowerCase();
            const notationTypeNameCapitalized = capitalize(notationTypeName);
            const modelName = boardModelName + notationTypeNameCapitalized;

            if (!parentUUId) {
                logger.warn(`Parent UUID is null for ${boardType} ${notationType}`);
                return null;
            }

            if (!findModel(modelName)) {
                logger.error(`Model ${modelName} not found`);
                return null;
            }

            if (!db.sequelize.models[boardModelName]) {
                logger.error(`Board model ${boardModelName} not found`);
                return null;
            }

            let parentId;
            try {
                parentId = await getIdByUUId(boardModelName, parentUUId);
            } catch (error) {
                logger.error(`Failed to get parent ID: ${error}`);
                throw error;
            }

            if (!parentId) {
                logger.warn(`Parent ID not found for UUID: ${parentUUId}`);
                return null;
            }

            try {
                const results = await findModel(modelName).findAll({
                    where: {
                        [boardFieldIdFieldName]: parentId,
                    },
                    include: [
                        Color,
                        User,
                        db.sequelize.models[boardModelName],
                    ],
                });
                logger.info(`Found ${results.length} notations`);
                return results;
            } catch (error) {
                logger.error(`Failed to fetch notations: ${error}`);
                throw error;
            }
        } catch (error) {
            logger.error(`Error in getNotations: ${error}`);
            throw error;
        }
    }

    async function createNotation(
        boardType: String,
        notationType: String,
        notation: NotationAttributes
    ) {
        logger.info(`Creating notation of type ${notationType} for ${boardType}`);
        const modelName = getModelName(boardType, notationType);
        const boardName = boardType.toString().toLowerCase();
        const boardModelName = capitalize(boardName);

        if (!validateModel(notation)) {
            logger.error(`Invalid notation model: ${JSON.stringify(notation)}`);
            return;
        }

        try {
            (notation as any).userId = (await getIdByUUId(
                "User",
                notation.user.uuid
            )) as number;

            (notation as any)[boardName + "Id"] = (await getIdByUUId(
                boardModelName,
                notation.parentUUId
            )) as number;

            const res = await findModel(modelName).create(notation as any);
            logger.info(`Created notation with ID: ${res.dataValues.id}`);

            return await findModel(modelName).findByPk(
                res.dataValues.id,
                {
                    include: [
                        User,
                        db.sequelize.models[boardModelName],
                    ],
                }
            );
        } catch (error) {
            logger.error(`Error creating notation: ${error}\n${error instanceof Error ? error.stack : ''}`);
            throw error;
        }
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

    async function updatePassword(
        token: string,
        password: string,
    ) {

        const user = await User.findOne({
            where: {
                reset_pasword_token: token,
            },
        });
        if (!user) {
            throw new Error(`User with token ${token} not found`);
        }
        user.password = password;
        user.reset_pasword_token = null;
        await user.save();
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
        try {
            if (!validateColAndRowRounded(model)) {
                throw new Error(`Non-integer grid coordinates found in model: ${JSON.stringify(model)}`);
            }
            
            switch (model.notationType) {
                case "TEXT":
                case "IMAGE": {
                    const m = model as RectNotationAttributes;
                    validateRectNotation(m);
                    break;
                }
                case "LOGBASE":
                case "EXPONENT": {
                    const m = model as PointNotationAttributes;
                    validateExponentNotation(m);
                    break;
                }
                case "SIGN":
                case "SYMBOL": {
                    const m = model as PointNotationAttributes;
                    validatePointNotation(m);
                    break;
                }
                case "SQRT": {
                    const m = model as SqrtNotationAttributes;
                    validateSqrtNotation(m);
                    break;
                }
                case "LINE": {
                    const m = model as LineNotationAttributes;
                    validateLineNotation(m);
                    break;
                }
                case "CURVE": {
                    const m = model as CurveNotationAttributes;
                    validateCurveNotation(m);
                    break;
                }
            }
            return true;
        } catch (error: any) {
            logger.error(`Model validation failed: ${error.message}`);
            throw error;
        }
    }

    function validateRectNotation(m: RectNotationAttributes): void {
        if (m.fromCol < 0) throw new Error(`fromCol must be >= 0, got ${m.fromCol}`);
        if (m.toCol < 0) throw new Error(`toCol must be >= 0, got ${m.toCol}`);
        if (m.toRow < 0) throw new Error(`toRow must be >= 0, got ${m.toRow}`);
        if (m.fromCol > m.toCol) throw new Error(`fromCol (${m.fromCol}) must be <= toCol (${m.toCol})`);
    }

    function validateExponentNotation(m: PointNotationAttributes): void {
        if ((m.col ?? 0) < 0) throw new Error(`col must be >= 0, got ${m.col}`);
        if ((m.row ?? 0) < 0) throw new Error(`row must be >= 0, got ${m.row}`);
        if (m.value && m.value.toString().length === 0) {
            throw new Error("exponent cannot be empty if provided");
        }
    }

    function validatePointNotation(m: PointNotationAttributes): void {
        if ((m.col ?? 0) < 0) throw new Error(`col must be >= 0, got ${m.col}`);
        if ((m.row ?? 0) < 0) throw new Error(`row must be >= 0, got ${m.row}`);
    }

    function validateSqrtNotation(m: SqrtNotationAttributes): void {
        if (m.fromCol < 0) throw new Error(`fromCol must be >= 0, got ${m.fromCol}`);
        if (m.toCol < 0) throw new Error(`toCol must be >= 0, got ${m.toCol}`);
        if (m.row < 0) throw new Error(`row must be >= 0, got ${m.row}`);
        if (m.fromCol >= m.toCol) throw new Error(`fromCol (${m.fromCol}) must be < toCol (${m.toCol})`);
    }

    function validateLineNotation(m: LineNotationAttributes): void {
        if (m.p1x < 0) throw new Error(`p1x must be >= 0, got ${m.p1x}`);
        if (m.p2x < 0) throw new Error(`p2x must be >= 0, got ${m.p2x}`);
        if (m.p1y < 0) throw new Error(`p1y must be >= 0, got ${m.p1y}`);
        if (m.p2y < 0) throw new Error(`p2y must be >= 0, got ${m.p2y}`);
   }


    function validateCurveNotation(m: CurveNotationAttributes): void {
        if (m.p1x <= 0) throw new Error(`p1x must be > 0, got ${m.p1x}`);
        if (m.p1y <= 0) throw new Error(`p1y must be > 0, got ${m.p1y}`);
        if (m.p2x <= 0) throw new Error(`p2x must be > 0, got ${m.p2x}`);
        if (m.p2y < 0) throw new Error(`p2y must be >= 0, got ${m.p2y}`);
    }

    async function storeResetToken(
        email: string,
        token: string
    ): Promise<void> {
        try {
            const user = await getUserByEmail(email);
            if (!user) {
                throw new Error(`User with email ${email} not found`);
            }
            user.reset_pasword_token = token;
            await user.save();
        } catch (error) {
            logger.error(`Failed to store reset token: ${error}`);
            throw error;
        }
    }

    function validateColAndRowRounded(model: NotationAttributes): boolean {
        const m = model as RectNotationAttributes &
            PointNotationAttributes;

        if (m.col && !Number.isSafeInteger(m.col)) return false;
        if (m.row && !Number.isSafeInteger(m.row)) return false;
        if (m.fromCol && !Number.isSafeInteger(m.fromCol)) return false;
        if (m.toCol && !Number.isSafeInteger(m.toCol)) return false;

        return true;
    }


    async function getUserIdOfNotation(uuid: string, url: string) {
        const model = getModelNameByUrl(url);

        let res = await model.findOne({
            attributes: {
                include: ["userId"],
            },
            where: {
                uuid: uuid,
            },
        }) as any;

        if (!res) {
            logger.error(`No notation found for UUID: ${uuid} and URL: ${url}`);
            return null;
        }
        
        return res.userId as number;
    }

    return {
        getIdByUUId,
        getUser,
        createUser,
        getUserByEmail,
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
        storeResetToken,
        getResetToken,
        updatePassword,
        getUserIdOfNotation,
    };
}


