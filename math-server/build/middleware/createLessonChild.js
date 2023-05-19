"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbUtil_1 = __importDefault(require("../../../math-db/build/dbUtil"));
exports.default = {
    create: {
        write: {
            // replace LessonUUId with id
            before: (req, res, context) => __awaiter(void 0, void 0, void 0, function* () {
                if (!!req.body.LessonUUId) {
                    req.body.LessonId = yield dbUtil_1.default.getIdByUUID("Lesson", req.body.LessonUUId);
                }
                return context.continue;
            }),
            // replace id with LessonUUId
            after: (req, res, context) => __awaiter(void 0, void 0, void 0, function* () {
                if (!!context.instance.dataValues.LessonId) {
                    context.instance.dataValues.LessonUUId =
                        yield dbUtil_1.default.getUUIDById("Lesson", context.instance.dataValues.LessonId);
                    context.instance.dataValues.LessonId = null;
                }
                return context.continue;
            }),
        },
    },
};
//# sourceMappingURL=createLessonChild.js.map