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
Object.defineProperty(exports, "__esModule", { value: true });
const dbUtil = require("../../../math-db/build/dbUtil");
exports.default = {
    list: {
        fetch: {
            before: (req, res, context) => __awaiter(void 0, void 0, void 0, function* () {
                if (!!req.query.LessonUUId) {
                    req.query.LessonId = yield dbUtil.getIdByUUID("Lesson", req.query.LessonUUId);
                }
                return context.continue;
            }),
            // replace id with LessonUUId
            after: (req, res, context) => __awaiter(void 0, void 0, void 0, function* () {
                for (const i in context.instance) {
                    context.instance[i].dataValues.LessonUUId =
                        yield dbUtil.getUUIDById("Lesson", context.instance[i].dataValues.LessonId);
                }
                return context.continue;
            }),
        },
    },
};
//# sourceMappingURL=getLessonChildren.js.map