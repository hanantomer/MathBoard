"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const boardDecorator_1 = __importDefault(require("../boardDecorator"));
function QuestionDecorator(tableName) {
    return function (target) {
        (0, boardDecorator_1.default)(tableName)(target);
        (0, sequelize_typescript_1.DefaultScope)(() => ({
            attributes: {
                exclude: ["QuestionId"],
            },
        }))(target);
        (0, sequelize_typescript_1.Table)({
            indexes: [
                {
                    fields: ["QuestionId"],
                },
            ],
        })(target);
    };
}
exports.default = QuestionDecorator;
//# sourceMappingURL=questionDecorator.js.map