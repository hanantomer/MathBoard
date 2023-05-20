"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authUtil_1 = __importDefault(require("../../math-auth/build/authUtil"));
const dbUtil_1 = __importDefault(require("../../math-db/build/dbUtil"));
const util_1 = __importDefault(require("./util"));
const constants_1 = __importDefault(require("./constants"));
class AuthenticationService {
    constructor(app) {
        this.app = app;
        this.lessonAdminConnection = new Map(); // key lesson, value: userId/connection(1 only)
        this.lessonStudentConnection = new Map(); // key lesson, value: set where key:userId
    }
    async authUserByToken(access_token) {
        let user = await authUtil_1.default.authByLocalToken(access_token);
        if (!user) {
            console.error(`access_token:${access_token} not accociated with any user`);
            return;
        }
        return user;
    }
    // manage user login, join user to lesson or user channels
    async create(data, params) {
        let user = await util_1.default.getUserFromCookie(params.headers.cookie, this.app);
        if (!user) {
            return;
        }
        let lessonId = await dbUtil_1.default.getIdByUUID("Lesson", data.LessonUUId);
        if (!lessonId) {
            return;
        }
        let isTeacher = await dbUtil_1.default.isTeacher(user.id, lessonId);
        if (isTeacher) {
            // store admin connection when she logs on
            this.lessonAdminConnection.set(lessonId, {
                userId: user.id,
                connection: params.connection,
            });
            // join admin to existing student channels
            if (this.lessonStudentConnection.has(lessonId)) {
                this.lessonStudentConnection.get(lessonId).forEach((student) => {
                    // join admin to all student channels
                    this.app
                        .channel(constants_1.default.LESSON_CHANNEL_PREFIX +
                        data.LessonUUId +
                        constants_1.default.USER_CHANNEL_PREFIX +
                        student)
                        .join(params.connection);
                    console.log(`subscribing admin: ${user.email} to student: ${student}`);
                });
            }
        }
        else {
            if (!this.lessonStudentConnection.has(lessonId)) {
                this.lessonStudentConnection.set(lessonId, new Set());
            }
            this.lessonStudentConnection.get(lessonId).add(user.id);
            // join studnet to student channel
            this.app
                .channel(constants_1.default.LESSON_CHANNEL_PREFIX +
                data.LessonUUId +
                constants_1.default.USER_CHANNEL_PREFIX +
                user.id)
                .join(params.connection);
            console.log(`subscribing student: ${user.email} to lesson: ${lessonId}`);
            // join admin to student channel
            if (this.lessonAdminConnection.has(lessonId)) {
                console.log(`subscribing admin: ${user.email} to student: ${user.id}`);
                this.app
                    .channel(constants_1.default.LESSON_CHANNEL_PREFIX +
                    data.LessonUUId +
                    constants_1.default.USER_CHANNEL_PREFIX +
                    user.id)
                    .join(this.lessonAdminConnection.get(lessonId).connection);
            }
        }
        // either teacher or student join lesson channel
        this.app
            .channel(constants_1.default.LESSON_CHANNEL_PREFIX + data.LessonUUId)
            .join(params.connection);
        console.log(`subscribing user: ${user.email} to lesson: ${lessonId}`);
    }
}
exports.default = AuthenticationService;
//# sourceMappingURL=authenticationService.js.map