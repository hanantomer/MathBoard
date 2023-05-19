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
const answerDecorator_1 = __importDefault(require("../answerDecorator"));
const sequelize_typescript_1 = require("sequelize-typescript");
const user_model_1 = __importDefault(require("../../user.model"));
const answer_model_1 = __importDefault(require("../answer.model"));
let AnswerRoot = class AnswerRoot extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.default),
    __metadata("design:type", Number)
], AnswerRoot.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.default),
    __metadata("design:type", user_model_1.default)
], AnswerRoot.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => answer_model_1.default),
    __metadata("design:type", Number)
], AnswerRoot.prototype, "answerId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => answer_model_1.default),
    __metadata("design:type", answer_model_1.default)
], AnswerRoot.prototype, "answer", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AnswerRoot.prototype, "fromCol", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AnswerRoot.prototype, "toCol", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AnswerRoot.prototype, "row", void 0);
AnswerRoot = __decorate([
    (0, answerDecorator_1.default)("AnswerRoot")
], AnswerRoot);
exports.default = AnswerRoot;
//# sourceMappingURL=answerlRoot.model.js.map