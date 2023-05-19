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
                if (!!req.query.boardType &&
                    !!req.query.id &&
                    !!req.query.fromCol &&
                    !!req.query.toCol &&
                    !!req.query.fromRow &&
                    !!req.query.toRow) {
                    let ovelapedNotation = yield dbUtil.findRectOverlapsWithNewRect(req.query.boardType, req.query.id, req.query.fromRow, req.query.toRow, req.query.fromCol, req.query.toCol);
                    res.status(200).json(ovelapedNotation);
                    return context.stop;
                }
                if (!!req.query.boardType &&
                    !!req.query.id &&
                    !!req.query.fromCol &&
                    !!req.query.toCol) {
                    let ovelapedNotation = yield dbUtil.findRectOverlapsWithNewLine(req.query.boardType, req.query.id, req.query.fromRow, req.query.toRow);
                    res.status(200).json(ovelapedNotation);
                    return context.stop;
                }
                return context.continue;
            }),
        },
    },
};
//# sourceMappingURL=_notationMiddleware.js.map