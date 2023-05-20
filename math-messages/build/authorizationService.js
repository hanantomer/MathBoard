"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbUtil_1 = __importDefault(require("../../math-db/build/dbUtil"));
const util_js_1 = __importDefault(require("./util.js"));
class AuhorizationService {
    constructor(app) {
        this.app = app;
        this.lessonAuthorizedUsers = [];
    }
    async get(id, data, params) {
        let user = await util_js_1.default.getUserFromCookie(params.headers.cookie, this.app);
        if (!!user) {
            user.lessonId = await dbUtil_1.default.getIdByUUID("Lesson", data.LessonUUId);
            return (!!this.lessonAuthorizedUsers[user.lessonId] &&
                this.lessonAuthorizedUsers[user.lessonId].indexOf(user.id) >= 0);
        }
    }
    async update(id, data, params) {
        let user = await util_js_1.default.getUserFromCookie(params.headers.cookie, this.app);
        let lessonId = await dbUtil_1.default.getIdByUUID("Lesson", data.LessonUUId);
        let isTeacher = await dbUtil_1.default.isTeacher(user.id, lessonId);
        if (!isTeacher)
            return;
        return data;
    }
}
exports.default = AuhorizationService;
module.exports = AuhorizationService;
//# sourceMappingURL=authorizationService.js.map