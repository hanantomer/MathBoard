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
const user_model_1 = __importDefault(require("../../user.model"));
const question_model_1 = __importDefault(require("../../question/question.model"));
const questionDecorator_1 = __importDefault(require("../../question/questionDecorator"));
let QuestionFraction = class QuestionFraction extends sequelize_typescript_1.Model {
    notationType = enum_1.NotationType.FRACTION;
    boardType = enum_1.BoardType.QUESTION;
    value = null;
    uuid;
    userId;
    user;
    questionId;
    question;
    fromCol;
    toCol;
    row;
};
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, defaultValue: sequelize_typescript_1.DataType.UUIDV4 })
], QuestionFraction.prototype, "uuid", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.default)
], QuestionFraction.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.default)
], QuestionFraction.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => question_model_1.default)
], QuestionFraction.prototype, "questionId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => question_model_1.default)
], QuestionFraction.prototype, "question", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER })
], QuestionFraction.prototype, "fromCol", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER })
], QuestionFraction.prototype, "toCol", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER })
], QuestionFraction.prototype, "row", void 0);
QuestionFraction = __decorate([
    (0, questionDecorator_1.default)("LessonFraction")
], QuestionFraction);
exports.default = QuestionFraction;
//# sourceMappingURL=questionFraction.model.js.map