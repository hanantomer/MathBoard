"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    function getIdByUUId(model, uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield index_1.default.sequelize.models[model].findOne({
                attributes: {
                    include: ["id"],
                },
                where: {
                    uuid: uuid,
                },
            });
            return res === null || res === void 0 ? void 0 : res.get("id");
        });
    }
    // user
    function isTeacher(userUUId, lessonUUId) {
        return __awaiter(this, void 0, void 0, function* () {
            let lessonId = yield getIdByUUId("Lesson", lessonUUId);
            if (!lessonId)
                return false;
            let userId = yield getIdByUUId("User", userUUId);
            if (!userId)
                return false;
            let lesson = yield lesson_model_1.default.findByPk(lessonId);
            return (lesson === null || lesson === void 0 ? void 0 : lesson.user.id) === userId;
        });
    }
    function getUser(userUUId) {
        return __awaiter(this, void 0, void 0, function* () {
            let userId = yield getIdByUUId("User", userUUId);
            if (!userId)
                return null;
            return yield user_model_1.default.findByPk(userId);
        });
    }
    function getUserByEmailAndPassword(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_model_1.default.findOne({
                where: {
                    email: email,
                    password: password,
                },
            });
        });
    }
    function createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_model_1.default.create(user);
        });
    }
    // lesson
    function getLesson(lessonUUId) {
        return __awaiter(this, void 0, void 0, function* () {
            let lessonId = yield getIdByUUId("Lesson", lessonUUId);
            if (!lessonId)
                return null;
            return yield lesson_model_1.default.findByPk(lessonId);
        });
    }
    function getLessons(userUUId) {
        return __awaiter(this, void 0, void 0, function* () {
            let userId = yield getIdByUUId("User", userUUId);
            if (!userId)
                return null;
            return yield lesson_model_1.default.findAll({
                include: [{ model: user_model_1.default }],
                where: {
                    '$user.id$': 1
                }
            });
        });
    }
    function createLesson(lesson) {
        return __awaiter(this, void 0, void 0, function* () {
            lesson.userId = (yield getIdByUUId("User", lesson.user.uuid));
            return yield lesson_model_1.default.create(lesson);
        });
    }
    // student lesson
    function getStudentLessons(lessonUUId) {
        return __awaiter(this, void 0, void 0, function* () {
            let lessonId = yield getIdByUUId("Lesson", lessonUUId);
            if (!lessonId)
                return null;
            return yield studentLesson_model_1.default.findAll({
                where: {
                    lessonId: lessonId,
                },
            });
        });
    }
    function createStudentLesson(lesson) {
        return __awaiter(this, void 0, void 0, function* () {
            lesson.userId = (yield getIdByUUId("User", lesson.user.uuid));
            return yield studentLesson_model_1.default.create(lesson);
        });
    }
    // question
    function getQuestion(questionUUId) {
        return __awaiter(this, void 0, void 0, function* () {
            let questionId = yield getIdByUUId("Question", questionUUId);
            if (!questionId)
                return null;
            return yield question_model_1.default.findByPk(questionId);
        });
    }
    function getQuestions(lessonUUId) {
        return __awaiter(this, void 0, void 0, function* () {
            let lessonId = yield getIdByUUId("Lesson", lessonUUId);
            if (!lessonId)
                return null;
            return yield question_model_1.default.findAll({
                where: {
                    '$lesson.id$': 1
                },
            });
        });
    }
    function createQuestion(question) {
        return __awaiter(this, void 0, void 0, function* () {
            question.userId = (yield getIdByUUId("User", question.user.uuid));
            question.lessonId = (yield getIdByUUId("Lesson", question.lesson.uuid));
            return yield question_model_1.default.create(question);
        });
    }
    // answer
    function getAnswer(answerUUId) {
        return __awaiter(this, void 0, void 0, function* () {
            let answerId = yield getIdByUUId("Answer", answerUUId);
            if (!answerId)
                return null;
            return yield answer_model_1.default.findByPk(answerId);
        });
    }
    function getAnswers(questionUUId) {
        return __awaiter(this, void 0, void 0, function* () {
            let questionId = yield getIdByUUId("Question", questionUUId);
            if (!questionId)
                return null;
            return yield answer_model_1.default.findAll({
                where: {
                    '$question.id$': 1
                },
            });
        });
    }
    function createAnswer(answer) {
        return __awaiter(this, void 0, void 0, function* () {
            answer.userId = (yield getIdByUUId("User", answer.user.uuid));
            answer.questionId = (yield getIdByUUId("Question", answer.question.uuid));
            return yield answer_model_1.default.create(answer);
        });
    }
    function getUserAnswer(userUUId, questionUUId) {
        return __awaiter(this, void 0, void 0, function* () {
            let questionId = yield getIdByUUId("Question", questionUUId);
            if (!questionId)
                return null;
            let userId = yield getIdByUUId("User", userUUId);
            if (!userId)
                return null;
            return yield answer_model_1.default.findOne({
                where: {
                    user: {
                        Id: userId,
                    },
                    question: {
                        Id: questionId,
                    }
                },
            });
        });
    }
    function getNotations(boardType, notationType, parentUUId) {
        return __awaiter(this, void 0, void 0, function* () {
            const boardPrefix = boardType.toString().toLowerCase();
            const boardPrefixIdFieldName = boardType.toString().toLowerCase() + "Id";
            const boardPrefixCapitalized = (0, utils_1.capitalize)(boardPrefix);
            const notationTypeSuffix = notationType.toString().toLowerCase();
            const notationTypeSuffixCapitalized = (0, utils_1.capitalize)(notationTypeSuffix);
            const notationName = boardPrefixCapitalized + notationTypeSuffixCapitalized;
            let parentId = yield getIdByUUId(boardPrefixCapitalized, parentUUId);
            if (!parentId)
                return null;
            return yield index_1.default.sequelize.models[notationName].findAll({
                where: {
                    [boardPrefixIdFieldName]: parentId,
                },
            });
        });
    }
    function createNotation(boardType, notationType, notation) {
        return __awaiter(this, void 0, void 0, function* () {
            ///TODO : move to utility function
            const boardPrefix = boardType.toString().toLowerCase();
            const boardPrefixCapitalized = (0, utils_1.capitalize)(boardPrefix);
            const notationTypeSuffix = notationType.toString().toLowerCase();
            const notationTypeSuffixCapitalized = (0, utils_1.capitalize)(notationTypeSuffix);
            const notationName = boardPrefixCapitalized + notationTypeSuffixCapitalized;
            return yield index_1.default.sequelize.models[notationName].create(notation);
        });
    }
    return {
        getIdByUUId,
        isTeacher,
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
        getStudentLessons,
        createStudentLesson,
    };
}
exports.default = dbUtil;
//# sourceMappingURL=dbUtil.js.map