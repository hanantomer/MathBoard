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
const user_model_1 = __importDefault(require("../user.model"));
const lesson_model_1 = __importDefault(require("./lesson.model"));
const sequelize_typescript_1 = require("sequelize-typescript");
let StudentLesson = class StudentLesson extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.default),
    __metadata("design:type", Number)
], StudentLesson.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.default, {
        foreignKey: {
            allowNull: false,
        },
    }),
    __metadata("design:type", user_model_1.default)
], StudentLesson.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => lesson_model_1.default),
    __metadata("design:type", Number)
], StudentLesson.prototype, "lessonId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => lesson_model_1.default, {
        foreignKey: {
            allowNull: false,
        },
    }),
    __metadata("design:type", lesson_model_1.default)
], StudentLesson.prototype, "lesson", void 0);
StudentLesson = __decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: true,
        tableName: "studentLesson",
        freezeTableName: true,
        indexes: [
            {
                unique: true,
                fields: ["LessonId", "UserId"],
            },
        ],
    }),
    (0, sequelize_typescript_1.DefaultScope)(() => ({
        attributes: {
            exclude: ["LessonId"],
        },
    }))
], StudentLesson);
exports.default = StudentLesson;
;
//# sourceMappingURL=studentLesson.model.js.map