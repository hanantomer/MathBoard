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
const lessonDecorator_1 = __importDefault(require("../lessonDecorator"));
const user_model_1 = __importDefault(require("../../user.model"));
const lesson_model_1 = __importDefault(require("../lesson.model"));
let LessonSymbol = class LessonSymbol extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.default),
    __metadata("design:type", Number)
], LessonSymbol.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.default),
    __metadata("design:type", user_model_1.default)
], LessonSymbol.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => lesson_model_1.default),
    __metadata("design:type", Number)
], LessonSymbol.prototype, "lessonId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => lesson_model_1.default),
    __metadata("design:type", lesson_model_1.default)
], LessonSymbol.prototype, "lesson", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], LessonSymbol.prototype, "col", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], LessonSymbol.prototype, "row", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], LessonSymbol.prototype, "value", void 0);
LessonSymbol = __decorate([
    (0, lessonDecorator_1.default)("LessonSymbol")
], LessonSymbol);
exports.default = LessonSymbol;
//# sourceMappingURL=lessonSymbol.model.js.map