"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authUtil_1 = __importDefault(require("../../math-auth/build/authUtil"));
const dbUtil_1 = __importDefault(require("../../math-db/build/dbUtil"));
const util_1 = __importDefault(require("./util"));
const constants_1 = __importDefault(require("./constants"));
const authUtil = (0, authUtil_1.default)();
const dbUtil = (0, dbUtil_1.default)();
class AuthenticationService {
    constructor(app) {
        this.app = app;
        this.lessonAdminConnection = new Map(); // key lesson, value: userId/connection(1 only)
        this.lessonStudentConnection = new Map(); // key lesson, value: set where key:userId
    }
    async get(id, params) {
        let user = await authUtil.authByLocalToken(params.access_token);
        if (!user) {
            console.error(`access_token:${params.access_token} not accociated with any user`);
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
        if (!data.LessonUUId) {
            return;
        }
        let isTeacher = await dbUtil.isTeacher(user.id, data.LessonUUId);
        if (isTeacher) {
            // store admin connection when she logs on
            this.lessonAdminConnection.set(data.LessonUUId, {
                userId: user.id,
                connection: params.connection,
            });
            // join admin to existing student channels
            if (this.lessonStudentConnection.has(data.LessonUUId)) {
                this.lessonStudentConnection
                    .get(data.LessonUUId)
                    .forEach((student) => {
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
            if (!this.lessonStudentConnection.has(data.LessonUUId)) {
                this.lessonStudentConnection.set(data.LessonUUId, new Set());
            }
            this.lessonStudentConnection.get(data.LessonUUId).add(user.id);
            // join studnet to student channel
            this.app
                .channel(constants_1.default.LESSON_CHANNEL_PREFIX +
                data.LessonUUId +
                constants_1.default.USER_CHANNEL_PREFIX +
                user.id)
                .join(params.connection);
            console.log(`subscribing student: ${user.email} to lesson: ${data.LessonUUId}`);
            // join admin to student channel
            if (this.lessonAdminConnection.has(data.LessonUUId)) {
                console.log(`subscribing admin: ${user.email} to student: ${user.id}`);
                this.app
                    .channel(constants_1.default.LESSON_CHANNEL_PREFIX +
                    data.LessonUUId +
                    constants_1.default.USER_CHANNEL_PREFIX +
                    user.id)
                    .join(this.lessonAdminConnection.get(data.LessonUUId).connection);
            }
        }
        // either teacher or student join lesson channel
        this.app
            .channel(constants_1.default.LESSON_CHANNEL_PREFIX + data.LessonUUId)
            .join(params.connection);
        console.log(`subscribing user: ${user.email} to lesson: ${data.LessonUUId}`);
    }
}
exports.default = AuthenticationService;
//# sourceMappingURL=authenticationService.js.map