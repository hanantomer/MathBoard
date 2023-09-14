export var BoardType;
(function (BoardType) {
    BoardType[BoardType["LESSON"] = 0] = "LESSON";
    BoardType[BoardType["QUESTION"] = 1] = "QUESTION";
    BoardType[BoardType["ANSWER"] = 2] = "ANSWER";
})(BoardType || (BoardType = {}));
;
export var NotationShape;
(function (NotationShape) {
    NotationShape[NotationShape["POINT"] = 0] = "POINT";
    NotationShape[NotationShape["LINE"] = 1] = "LINE";
    NotationShape[NotationShape["RECT"] = 2] = "RECT";
})(NotationShape || (NotationShape = {}));
export var NotationType;
(function (NotationType) {
    NotationType["SYMBOL"] = "SYMBOL";
    NotationType["SIGN"] = "SIGN";
    NotationType["POWER"] = "POWER";
    NotationType["FRACTION"] = "FRACTION";
    NotationType["SQRT"] = "SQRT";
    NotationType["SQRTSYMBOL"] = "SQRTSYMBOL";
    NotationType["TEXT"] = "TEXT";
    NotationType["IMAGE"] = "IMAGE";
    NotationType["GEO"] = "GEO";
})(NotationType || (NotationType = {}));
;
export const NotationTypeShape = new Map([
    [NotationType.SYMBOL, NotationShape.POINT],
    [NotationType.SIGN, NotationShape.POINT],
    [NotationType.POWER, NotationShape.POINT],
    [NotationType.SQRT, NotationShape.LINE],
    [NotationType.FRACTION, NotationShape.LINE],
    [NotationType.TEXT, NotationShape.RECT],
    [NotationType.IMAGE, NotationShape.RECT],
    [NotationType.GEO, NotationShape.RECT]
]);
export var AreaSelectionMode;
(function (AreaSelectionMode) {
    AreaSelectionMode[AreaSelectionMode["SELECTING"] = 0] = "SELECTING";
    AreaSelectionMode[AreaSelectionMode["MOVE"] = 1] = "MOVE";
})(AreaSelectionMode || (AreaSelectionMode = {}));
;
export var EditMode;
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
})(EditMode || (EditMode = {}));
;
export var UesrType;
(function (UesrType) {
    UesrType[UesrType["TEACHER"] = 0] = "TEACHER";
    UesrType[UesrType["STUDENT"] = 1] = "STUDENT";
})(UesrType || (UesrType = {}));
;
export var LoginType;
(function (LoginType) {
    LoginType[LoginType["LOGIN"] = 0] = "LOGIN";
    LoginType[LoginType["REGISTER"] = 1] = "REGISTER";
})(LoginType || (LoginType = {}));
;
//# sourceMappingURL=enum.js.map