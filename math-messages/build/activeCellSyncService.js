"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_js_1 = __importDefault(require("./util.js"));
class activeCellSyncService {
    constructor(app) {
        this.app = app;
    }
    async update(id, data, params) {
        let user = await util_js_1.default.getUserFromCookie(params.headers.cookie, this.app);
        if (!!user) {
            data.activeCell.UserId = user.id;
            console.debug(`rect position changed: ${JSON.stringify(data.activeCell)}`);
            return data.activeCell;
        }
    }
}
exports.default = activeCellSyncService;
//# sourceMappingURL=activeCellSyncService.js.map