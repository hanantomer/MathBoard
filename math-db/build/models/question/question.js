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
const sequelize_1 = require("sequelize");
const lesson_1 = __importDefault(require("../lesson/lesson"));
const sequelize_typescript_1 = require("sequelize-typescript");
let Question = class Question extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => lesson_1.default),
    __metadata("design:type", lesson_1.default)
], Question.prototype, "lesson", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    }),
    __metadata("design:type", String)
], Question.prototype, "uuid", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    }),
    __metadata("design:type", String)
], Question.prototype, "name", void 0);
Question = __decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: true,
        tableName: "question",
        freezeTableName: true,
        indexes: [
            {
                unique: true,
                fields: ["uuid"],
            },
        ],
    }),
    (0, sequelize_typescript_1.DefaultScope)(() => ({
        attributes: {
            exclude: ["id"],
        },
    }))
], Question);
exports.default = Question;
;
