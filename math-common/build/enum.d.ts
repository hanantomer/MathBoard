export declare enum BoardType {
    LESSON = 0,
    QUESTION = 1,
    ANSWER = 2
}
export declare enum NotationShape {
    POINT = 0,
    LINE = 1,
    RECT = 2
}
export declare enum NotationType {
    SYMBOL = "SYMBOL",
    SIGN = "SIGN",
    POWER = "POWER",
    FRACTION = "FRACTION",
    SQRT = "SQRT",
    SQRTSYMBOL = "SQRTSYMBOL",
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    GEO = "GEO"
}
export declare const NotationTypeShape: Map<string, number>;
export declare enum AreaSelectionMode {
    SELECTING = 0,
    MOVE = 1
}
export declare enum EditMode {
    SYMBOL = 0,
    POWER = 1,
    TEXT = 2,
    FRACTION = 3,
    SQRT = 4,
    DELETING = 5,
    SELECT = 6,
    CHECKMARK = 7,
    SEMICHECKMARK = 8,
    XMARK = 9
}
export declare enum UesrType {
    TEACHER = 0,
    STUDENT = 1
}
export declare enum LoginType {
    LOGIN = 0,
    REGISTER = 1
}
