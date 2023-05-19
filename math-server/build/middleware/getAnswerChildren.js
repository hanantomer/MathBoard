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
                if (!!req.query.AnswerUUId) {
                    req.query.AnswerId = yield dbUtil.getIdByUUID("Answer", req.query.AnswerUUId);
                }
                return context.continue;
            }),
            // replace id with AnswerUUId
            // after: async (req: any, res: any, context: any) => {
            //     if (!!context.instance.dataValues.AnswerId) {
            //         context.instance.dataValues.AnswerUUId =
            //             await dbUtil.getUUIDById(
            //                 "Answer",
            //                 context.instance.dataValues.AnswerId
            //             );
            //     }
            //     return context.continue;
            // },
            after: (req, res, context) => __awaiter(void 0, void 0, void 0, function* () {
                context.instance.forEach((n) => __awaiter(void 0, void 0, void 0, function* () {
                    n.dataValues.AnswerUUId = yield dbUtil.getUUIDById("Answer", n.dataValues.AnswerId);
                }));
                return context.continue;
            }),
        },
    },
};
//# sourceMappingURL=getAnswerChildren.js.map