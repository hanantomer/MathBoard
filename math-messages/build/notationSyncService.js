"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_js_1 = __importDefault(require("./util.js"));
class notationSyncService {
    constructor(app) {
        this.app = app;
    }
    async enrichNotation(notation, userId) {
        if (!!notation) {
            notation.UserId = userId;
        }
    }
    async create(data, params) {
        let user = await util_js_1.default.getUserFromCookie(params.headers.cookie, this.app);
        if (!!user) {
            this.enrichNotation(data.notation.data, user.id);
        }
        return data.notation;
    }
    async update(id, data, params) {
        let user = await util_js_1.default.getUserFromCookie(params.headers.cookie, this.app);
        if (!!user) {
            this.enrichNotation(data.notation, user.id);
            return data.notation;
        }
    }
    async remove(data, params) {
        let user = await util_js_1.default.getUserFromCookie(params.headers.cookie, this.app);
        if (!!user) {
            this.enrichNotation(data.notation, user.id);
            return data.notation;
        }
    }
}
exports.default = notationSyncService;
//# sourceMappingURL=notationSyncService.js.map