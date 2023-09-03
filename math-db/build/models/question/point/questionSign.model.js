"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const enum_1 = require("../../../../../math-common/build/enum");
const questionDecorator_1 = __importDefault(require("../questionDecorator"));
const user_model_1 = __importDefault(require("../../user.model"));
const question_model_1 = __importDefault(require("../question.model"));
let QuestionSign = class QuestionSign extends sequelize_typescript_1.Model {
    notationType = enum_1.NotationType.SIGN;
    boardType = enum_1.BoardType.QUESTION;
    uuid;
    userId;
    user;
    questionId;
    question;
    col;
    row;
    value;
};
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, defaultValue: sequelize_typescript_1.DataType.UUIDV4 })
], QuestionSign.prototype, "uuid", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.default)
], QuestionSign.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.default)
], QuestionSign.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => question_model_1.default)
], QuestionSign.prototype, "questionId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => question_model_1.default)
], QuestionSign.prototype, "question", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER })
], QuestionSign.prototype, "col", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER })
], QuestionSign.prototype, "row", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING })
], QuestionSign.prototype, "value", void 0);
QuestionSign = __decorate([
    (0, questionDecorator_1.default)("QuestionSign")
], QuestionSign);
exports.default = QuestionSign;
//# sourceMappingURL=questionSign.model.js.map