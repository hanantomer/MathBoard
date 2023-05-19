"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotationType = exports.BoardType = void 0;
var BoardType;
(function (BoardType) {
    BoardType[BoardType["lesson"] = 0] = "lesson";
    BoardType[BoardType["question"] = 1] = "question";
    BoardType[BoardType["answer"] = 2] = "answer";
})(BoardType = exports.BoardType || (exports.BoardType = {}));
;
var NotationType;
(function (NotationType) {
    NotationType[NotationType["symbol"] = 0] = "symbol";
    NotationType[NotationType["sign"] = 1] = "sign";
    NotationType[NotationType["power"] = 2] = "power";
    NotationType[NotationType["fraction"] = 3] = "fraction";
    NotationType[NotationType["sqrt"] = 4] = "sqrt";
    NotationType[NotationType["text"] = 5] = "text";
    NotationType[NotationType["image"] = 6] = "image";
})(NotationType = exports.NotationType || (exports.NotationType = {}));
;
