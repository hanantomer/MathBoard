"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const questionDecorator_1 = __importDefault(require("../questionDecorator"));
const user_model_1 = __importDefault(require("../../user.model"));
const question_model_1 = __importDefault(require("../question.model"));
let QuestionImage = class QuestionImage extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.default),
    __metadata("design:type", Number)
], QuestionImage.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.default),
    __metadata("design:type", user_model_1.default)
], QuestionImage.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => question_model_1.default),
    __metadata("design:type", Number)
], QuestionImage.prototype, "questionId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => question_model_1.default),
    __metadata("design:type", question_model_1.default)
], QuestionImage.prototype, "question", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], QuestionImage.prototype, "fromCol", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], QuestionImage.prototype, "toCol", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], QuestionImage.prototype, "fromRow", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], QuestionImage.prototype, "toRow", void 0);
QuestionImage = __decorate([
    (0, questionDecorator_1.default)("QuestionImage")
], QuestionImage);
exports.default = QuestionImage;
//# sourceMappingURL=lessonImage.model.js.map