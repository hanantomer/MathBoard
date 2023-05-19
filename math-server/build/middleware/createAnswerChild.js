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
    create: {
        write: {
            // before save get AnswerId from AnswerUUId
            before: (req, res, context) => __awaiter(void 0, void 0, void 0, function* () {
                if (!!req.body.AnswerUUId) {
                    req.body.AnswerId = yield dbUtil.getIdByUUID("Answer", req.body.AnswerUUId);
                }
                return context.continue;
            }),
            // after save replace result id with uuid
            after: (req, res, context) => __awaiter(void 0, void 0, void 0, function* () {
                if (!!context.instance.dataValues.AnswerId) {
                    context.instance.dataValues.AnswerUUId =
                        yield dbUtil.getUUIDById("Answer", context.instance.dataValues.AnswerId);
                    context.instance.dataValues.AnswerId = null;
                }
                return context.continue;
            }),
        },
    },
};
//# sourceMappingURL=createAnswerChild.js.map