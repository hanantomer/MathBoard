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
            before: (req, res, context) => __awaiter(void 0, void 0, void 0, function* () {
                // check if exists
                let answer = yield dbUtil.findUserAnswer(context.user.id, req.body.QuestionId);
                if (!!answer) {
                    context.instance = answer;
                    return context.skip;
                }
                return context.continue;
            }),
        },
    },
};
//# sourceMappingURL=createAnswer.js.map