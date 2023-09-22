"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginType = exports.UesrType = exports.EditMode = exports.AreaSelectionMode = exports.NotationTypeShape = exports.NotationType = exports.NotationShape = exports.BoardType = void 0;
var BoardType;
(function (BoardType) {
    BoardType[BoardType["LESSON"] = 0] = "LESSON";
    BoardType[BoardType["QUESTION"] = 1] = "QUESTION";
    BoardType[BoardType["ANSWER"] = 2] = "ANSWER";
})(BoardType || (exports.BoardType = BoardType = {}));
;
var NotationShape;
(function (NotationShape) {
    NotationShape[NotationShape["POINT"] = 0] = "POINT";
    NotationShape[NotationShape["LINE"] = 1] = "LINE";
    NotationShape[NotationShape["RECT"] = 2] = "RECT";
})(NotationShape || (exports.NotationShape = NotationShape = {}));
var NotationType;
(function (NotationType) {
    NotationType[NotationType["SYMBOL"] = 0] = "SYMBOL";
    NotationType[NotationType["SIGN"] = 1] = "SIGN";
    NotationType[NotationType["POWER"] = 2] = "POWER";
    NotationType[NotationType["FRACTION"] = 3] = "FRACTION";
    NotationType[NotationType["SQRT"] = 4] = "SQRT";
    NotationType[NotationType["SQRTSYMBOL"] = 5] = "SQRTSYMBOL";
    NotationType[NotationType["TEXT"] = 6] = "TEXT";
    NotationType[NotationType["IMAGE"] = 7] = "IMAGE";
    NotationType[NotationType["GEO"] = 8] = "GEO";
})(NotationType || (exports.NotationType = NotationType = {}));
;
exports.NotationTypeShape = new Map([
    [NotationType.SYMBOL, NotationShape.POINT],
    [NotationType.SIGN, NotationShape.POINT],
    [NotationType.POWER, NotationShape.POINT],
    [NotationType.SQRT, NotationShape.LINE],
    [NotationType.FRACTION, NotationShape.LINE],
    [NotationType.TEXT, NotationShape.RECT],
    [NotationType.IMAGE, NotationShape.RECT],
    [NotationType.GEO, NotationShape.RECT]
]);
var AreaSelectionMode;
(function (AreaSelectionMode) {
    AreaSelectionMode[AreaSelectionMode["SELECTING"] = 0] = "SELECTING";
    AreaSelectionMode[AreaSelectionMode["MOVE"] = 1] = "MOVE";
})(AreaSelectionMode || (exports.AreaSelectionMode = AreaSelectionMode = {}));
;
var EditMode;
(function (EditMode) {
    EditMode[EditMode["SYMBOL"] = 0] = "SYMBOL";
    EditMode[EditMode["POWER"] = 1] = "POWER";
    EditMode[EditMode["TEXT"] = 2] = "TEXT";
    EditMode[EditMode["FRACTION"] = 3] = "FRACTION";
    EditMode[EditMode["SQRT"] = 4] = "SQRT";
    EditMode[EditMode["DELETING"] = 5] = "DELETING";
    EditMode[EditMode["SELECT"] = 6] = "SELECT";
    EditMode[EditMode["CHECKMARK"] = 7] = "CHECKMARK";
    EditMode[EditMode["SEMICHECKMARK"] = 8] = "SEMICHECKMARK";
    EditMode[EditMode["XMARK"] = 9] = "XMARK";
})(EditMode || (exports.EditMode = EditMode = {}));
;
var UesrType;
(function (UesrType) {
    UesrType[UesrType["TEACHER"] = 0] = "TEACHER";
    UesrType[UesrType["STUDENT"] = 1] = "STUDENT";
})(UesrType || (exports.UesrType = UesrType = {}));
;
var LoginType;
(function (LoginType) {
    LoginType[LoginType["LOGIN"] = 0] = "LOGIN";
    LoginType[LoginType["REGISTER"] = 1] = "REGISTER";
})(LoginType || (exports.LoginType = LoginType = {}));
;
//# sourceMappingURL=enum.js.map