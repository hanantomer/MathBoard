export declare const BoardTypeValues: readonly ["LESSON", "QUESTION", "ANSWER"];
export type BoardType = typeof BoardTypeValues[number];
export type NotationShape = "POINT" | "LINE" | "RECT";
export declare const NotationTypeValues: readonly ["SYMBOL", "SIGN", "POWER", "FRACTION", "SQRT", "SQRTSYMBOL", "TEXT", "IMAGE", "GEO"];
export type NotationType = typeof NotationTypeValues[number];
export declare const NotationTypeShape: Map<"SYMBOL" | "SIGN" | "POWER" | "FRACTION" | "SQRT" | "SQRTSYMBOL" | "TEXT" | "IMAGE" | "GEO", NotationShape>;
export type AreaSelectionMode = "SELECTING" | "MOVE";
export type EditMode = "SYMBOL" | "POWER" | "TEXT" | "FRACTION" | "SQRT" | "DELETING" | // mouse clicked following delete button pressed
"SELECT" | //  after select button pressed
"CHECKMARK" | // after checkmark button pressed
"SEMICHECKMARK" | // after semicheck button pressed
"XMARK";
export type UesrType = "TEACHER" | "STUDENT";
export type LoginType = "LOGIN" | "REGISTER";
