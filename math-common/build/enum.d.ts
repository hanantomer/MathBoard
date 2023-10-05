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
    SYMBOL = 0,
    SIGN = 1,
    POWER = 2,
    FRACTION = 3,
    SQRT = 4,
    SQRTSYMBOL = 5,
    TEXT = 6,
    IMAGE = 7,
    GEO = 8
}
export declare const NotationTypeShape: Map<number, number>;
export declare enum AreaSelectionMode {
    SELECTING = 0,
    MOVE = 1
}
export type EditMode = "SYMBOL" | "POWER" | "TEXT" | "FRACTION" | "SQRT" | "DELETING" | // mouse clicked following delete button pressed
"SELECT" | //  after select button pressed
"CHECKMARK" | // after checkmark button pressed
"SEMICHECKMARK" | // after semicheck button pressed
"XMARK";
export declare enum UesrType {
    TEACHER = 0,
    STUDENT = 1
}
export declare enum LoginType {
    LOGIN = 0,
    REGISTER = 1
}
