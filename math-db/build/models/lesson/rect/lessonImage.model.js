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
const lessonDecorator_1 = __importDefault(require("../../lesson/lessonDecorator"));
const user_model_1 = __importDefault(require("../../user.model"));
const lesson_model_1 = __importDefault(require("../../lesson/lesson.model"));
let LessonImage = class LessonImage extends sequelize_typescript_1.Model {
    notationType = enum_1.NotationType.IMAGE;
    boardType = enum_1.BoardType.LESSON;
    uuid;
    userId;
    user;
    lessonId;
    lesson;
    fromCol;
    toCol;
    fromRow;
    toRow;
    value;
};
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, defaultValue: sequelize_typescript_1.DataType.UUIDV4 })
], LessonImage.prototype, "uuid", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.default)
], LessonImage.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.default)
], LessonImage.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => lesson_model_1.default)
], LessonImage.prototype, "lessonId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => lesson_model_1.default)
], LessonImage.prototype, "lesson", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER })
], LessonImage.prototype, "fromCol", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER })
], LessonImage.prototype, "toCol", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER })
], LessonImage.prototype, "fromRow", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER })
], LessonImage.prototype, "toRow", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING })
], LessonImage.prototype, "value", void 0);
LessonImage = __decorate([
    (0, lessonDecorator_1.default)("LessonImage")
], LessonImage);
exports.default = LessonImage;
//# sourceMappingURL=lessonImage.model.js.map