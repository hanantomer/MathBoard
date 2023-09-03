"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const lesson_model_1 = __importDefault(require("./models/lesson/lesson.model"));
const studentLesson_model_1 = __importDefault(require("./models/lesson/studentLesson.model"));
const question_model_1 = __importDefault(require("./models/question/question.model"));
const answer_model_1 = __importDefault(require("./models/answer/answer.model"));
const user_model_1 = __importDefault(require("./models/user.model"));
const index_1 = __importDefault(require("./models/index"));
const utils_1 = require("../../math-common/build/utils");
function dbUtil() {
    // utility
    async function getIdByUUId(model, uuid) {
        let res = await index_1.default.sequelize.models[model].findOne({
            attributes: {
                include: ["id"],
            },
            where: {
                uuid: uuid,
            },
        });
        return res?.get("id");
    }
    // user
    async function isTeacher(userUUId, lessonUUId) {
        let lessonId = await getIdByUUId("Lesson", lessonUUId);
        if (!lessonId)
            return false;
        let userId = await getIdByUUId("User", userUUId);
        if (!userId)
            return false;
        let lesson = await lesson_model_1.default.findByPk(lessonId);
        return lesson?.user.id === userId;
    }
    async function getUser(userUUId) {
        let userId = await getIdByUUId("User", userUUId);
        if (!userId)
            return null;
        return await user_model_1.default.findByPk(userId);
    }
    async function getUserByEmailAndPassword(email, password) {
        return user_model_1.default.findOne({
            where: {
                email: email,
                password: password,
            },
        });
    }
    async function createUser(user) {
        return await user_model_1.default.create(user);
    }
    // lesson
    async function getLesson(lessonUUId) {
        let lessonId = await getIdByUUId("Lesson", lessonUUId);
        if (!lessonId)
            return null;
        return await lesson_model_1.default.findByPk(lessonId);
    }
    async function getLessons(userUUId) {
        let userId = await getIdByUUId("User", userUUId);
        if (!userId)
            return null;
        return await lesson_model_1.default.findAll({
            where: {
                user: {
                    id: userId,
                },
            },
        });
    }
    async function createLesson(lesson) {
        return await lesson_model_1.default.create(lesson);
    }
    // student lesson
    async function getStudentLessons(lessonUUId) {
        let lessonId = await getIdByUUId("Lesson", lessonUUId);
        if (!lessonId)
            return null;
        return await studentLesson_model_1.default.findAll({
            where: {
                lessonId: lessonId,
            },
        });
    }
    async function createStudentLesson(lesson) {
        return await studentLesson_model_1.default.create(lesson);
    }
    // question
    async function getQuestion(questionUUId) {
        let questionId = await getIdByUUId("Question", questionUUId);
        if (!questionId)
            return null;
        return await question_model_1.default.findByPk(questionId);
    }
    async function getQuestions(lessonUUId) {
        let lessonId = await getIdByUUId("Lesson", lessonUUId);
        if (!lessonId)
            return null;
        return await question_model_1.default.findAll({
            where: {
                lessonId: lessonId,
            },
        });
    }
    async function createQuestion(question) {
        return await question_model_1.default.create(question);
    }
    // answer
    async function getAnswer(answerUUId) {
        let answerId = await getIdByUUId("Answer", answerUUId);
        if (!answerId)
            return null;
        return await answer_model_1.default.findByPk(answerId);
    }
    async function getAnswers(questionUUId) {
        let questionId = await getIdByUUId("Question", questionUUId);
        if (!questionId)
            return null;
        return await answer_model_1.default.findAll({
            where: {
                questionId: questionId,
            },
        });
    }
    async function createAnswer(answer) {
        return await answer_model_1.default.create(answer);
    }
    async function getUserAnswer(userUUId, questionUUId) {
        let questionId = await getIdByUUId("Question", questionUUId);
        if (!questionId)
            return null;
        let userId = await getIdByUUId("User", userUUId);
        if (!userId)
            return null;
        return await answer_model_1.default.findOne({
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
    async function getNotations(boardType, notationType, parentUUId) {
        const boardPrefix = boardType.toString().toLowerCase();
        const boardPrefixIdFieldName = boardType.toString().toLowerCase() + "Id";
        const boardPrefixCapitalized = (0, utils_1.capitalize)(boardPrefix);
        const notationTypeSuffix = notationType.toString().toLowerCase();
        const notationTypeSuffixCapitalized = (0, utils_1.capitalize)(notationTypeSuffix);
        const notationName = boardPrefixCapitalized + notationTypeSuffixCapitalized;
        let parentId = await getIdByUUId(boardPrefixCapitalized, parentUUId);
        if (!parentId)
            return null;
        return await index_1.default.sequelize.models[notationName].findAll({
            where: {
                [boardPrefixIdFieldName]: parentId,
            },
        });
    }
    async function createNotation(boardType, notationType, notation) {
        ///TODO : move to utility function
        const boardPrefix = boardType.toString().toLowerCase();
        const boardPrefixCapitalized = (0, utils_1.capitalize)(boardPrefix);
        const notationTypeSuffix = notationType.toString().toLowerCase();
        const notationTypeSuffixCapitalized = (0, utils_1.capitalize)(notationTypeSuffix);
        const notationName = boardPrefixCapitalized + notationTypeSuffixCapitalized;
        return await index_1.default.sequelize.models[notationName].create(notation);
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
exports.default = dbUtil;
//# sourceMappingURL=dbUtil.js.map