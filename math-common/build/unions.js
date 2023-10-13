"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotationTypeShape = exports.NotationTypeValues = exports.BoardTypeValues = void 0;
exports.BoardTypeValues = ["LESSON", "QUESTION", "ANSWER"];
exports.NotationTypeValues = ["SYMBOL", "SIGN", "POWER", "FRACTION", "SQRT", "SQRTSYMBOL", "TEXT", "IMAGE", "GEO"];
exports.NotationTypeShape = new Map([
    ["SYMBOL", "POINT"],
    ["SIGN", "POINT"],
    ["POWER", "POINT"],
    ["SQRT", "LINE"],
    ["FRACTION", "LINE"],
    ["TEXT", "RECT"],
    ["IMAGE", "RECT"],
    ["GEO", "RECT"]
]);
//# sourceMappingURL=unions.js.map