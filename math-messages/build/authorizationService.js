"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbUtil_1 = __importDefault(require("../../math-db/build/dbUtil"));
const util_1 = __importDefault(require("./util"));
const dbUtil = (0, dbUtil_1.default)();
class AuhorizationService {
    constructor(app) {
        this.app = app;
        this.lessonAuthorizedUsers = [];
    }
    async get(id, params) {
        let user = await util_1.default.getUserFromCookie(params.headers.cookie, this.app);
        if (!!user) {
            user.lessonId = await dbUtil.getIdByUUId("Lesson", params.LessonUUId);
            return (!!this.lessonAuthorizedUsers[user.lessonId] &&
                this.lessonAuthorizedUsers[user.lessonId].indexOf(user.id) >= 0);
        }
    }
    async update(id, data, params) {
        let user = await util_1.default.getUserFromCookie(params.headers.cookie, this.app);
        let lessonId = await dbUtil.getIdByUUId("Lesson", data.LessonUUId);
        let isTeacher = await dbUtil.isTeacher(user.id, data.LessonUUId);
        if (!isTeacher)
            return;
        return data;
    }
}
exports.default = AuhorizationService;
//# sourceMappingURL=authorizationService.js.map