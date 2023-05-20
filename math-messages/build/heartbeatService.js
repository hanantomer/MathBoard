"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("./util"));
class HeartbeatService {
    constructor(app) {
        this.app = app;
    }
    async update(id, data, params) {
        let access_token = await util_1.default.getAccessTokenFromCookie(params.headers.cookie);
        let user = await this.app
            .service("authentication")
            .authUserByToken(access_token);
        if (!!user) {
            return {
                LessonUUId: data.LessonUUId,
                userId: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
            };
        }
    }
}
exports.default = HeartbeatService;
//# sourceMappingURL=heartbeatService.js.map