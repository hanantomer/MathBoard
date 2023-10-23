export declare const BoardTypeValues: readonly ["LESSON", "QUESTION", "ANSWER"];
export type BoardType = typeof BoardTypeValues[number];
export type NotationShape = "POINT" | "LINE" | "RECT";
export declare const NotationTypeValues: readonly ["SYMBOL", "SIGN", "POWER", "FRACTION", "SQRT", "SQRTSYMBOL", "TEXT", "IMAGE", "GEO"];
export type NotationType = typeof NotationTypeValues[number];
export declare const NotationTypeShape: Map<"SYMBOL" | "SIGN" | "POWER" | "FRACTION" | "SQRT" | "SQRTSYMBOL" | "TEXT" | "IMAGE" | "GEO", NotationShape>;
export type AreaSelectionMode = "SELECTING" | "MOVE";
export type EditMode = "SYMBOL" | // default mode
"POWER" | // power button pressed
"TEXT" | // text button pressed
"FRACTION" | // fraction button pressed
"FRACTION_DRAWING" | // fraction drawing started
"FRACTION_SELECTING" | // fraction selecting
"FRACTION_SELECTED" | // fraction selected
"FRACTION_EDITITING" | // fraction selected and edit started
"SQRT" | // sqrt button pressed
"SQRT_DRAWING" | // sqrt drawing started
"SQRT_SELECTING" | // sqrt selected
"SQRT_EDITITING" | // sqrt selected and edit started
"SQRT_SELECTED" | // sqrt selected  
"DELETING" | // mouse clicked following delete button pressed
"SELECT" | // select button pressed
"CHECKMARK" | // checkmark button pressed
"SEMICHECKMARK" | // semicheck button pressed
"XMARK";
export type UesrType = "TEACHER" | "STUDENT";
export type LoginType = "LOGIN" | "REGISTER";
