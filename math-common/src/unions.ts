export const BoardTypeValues = [
  "LESSON",
  "QUESTION",
  "ANSWER",
] as const;

export type BoardType =
  (typeof BoardTypeValues)[number];

export type BusEventType =
  | "EV_QUESTION_SAVED"
  | "EV_COPY"
  | "EV_PASTE"
  | "EV_KEYUP"
  | "EV_MOUSEUP"
  | "EV_SVG_MOUSEUP"
  | "EV_SVG_MOUSEDOWN"
  | "EV_SVG_MOUSEMOVE"
  | "EV_AREA_SELECTION_DONE"
  | "EV_SLOPE_LINE_SELECTED"
  | "EV_CONCAVE_CURVE_SELECTED"
  | "EV_IMAGE_SELECTED"
  | "EV_TEXT_SELECTED"
  | "EV_CONVEX_CURVE_SELECTED"
  | "EV_VERTICAL_LINE_SELECTED"
  | "EV_SQRT_SELECTED"
  | "EV_HORIZONTAL_LINE_SELECTED";

export const NotationTypeValues = [
  "SYMBOL",
  "SIGN",
  "EXPONENT",
  "HORIZONTALLINE",
  "VERTICALLINE",
  "SLOPELINE",
  "CONCAVECURVE",
  "CONVEXCURVE",
  "SQRT",
  "SQRTSYMBOL",
  "TEXT",
  "ANNOTATION",
  "IMAGE",
] as const;

export type NotationType =
  (typeof NotationTypeValues)[number];

export type CursorType =
  | "auto"
  | "default"
  | "grab"
  | "grabbing"
  | "help"
  | "move"
  | "none"
  | "not-allowed"
  | "pointer"
  | "progress"
  | "text"
  | "wait";

// export const NotationTypeBackgroundColorizing =
//   new Set<NotationType>([
//     "SYMBOL",
//     "SIGN",
//     "EXPONENT",
//     "ANNOTATION",
//   ]);

export type EditMode =
  | "LESSONS_SELECTION" //  after click on lessons icon
  | "QUESTIONS_SELECTION" //  after click on questions icon
  | "ANSWERS_SELECTION" //  after click on answers icon
  | "SYMBOL" // default mode
  | "SPECIAL_SYMBOL" // special symbol in bottom toolbar pressed
  | "EXPONENT_STARTED" // exponent button pressed
  | "EXPONENT_WRITING" // user clicked a cell following exponent button pressed
  | "EXPONENT_SELECTED" // user clicked on existing exponent
  | "TEXT_STARTED" // text button pressed
  | "TEXT_SELECTED" // user clicked on existing text rectangle
  | "TEXT_AREA_SELECTING" // user started selecting area following text button pressed
  | "TEXT_WRITING" // user clicked a cell following text button pressed
  | "IMAGE_SELECTED" // user clicked on existing image
  | "ANNOTATION_STARTED" // annotation button pressed
  | "ANNOTATION_SELECTED" // user clicked on existing annotation rectangle
  | "ANNOTATION_WRITING" // user clicked a cell following annotation button pressed
  | "CELL_SELECTED" // user clicked on a cell or navigated via keys
  | "HORIZONTAL_LINE_STARTED" // horizontal line button pressed
  | "HORIZONTAL_LINE_DRAWING" // horizontal line drawing started
  | "HORIZONTAL_LINE_EDITING_RIGHT" // horizontal line handle clicked followin slope line selected
  | "HORIZONTAL_LINE_EDITING_LEFT" // horizontal line handle clicked followin slope line selected
  | "HORIZONTAL_LINE_SELECTED" // horizontal line selected
  | "VERTICAL_LINE_STARTED" // vertical line button pressed
  | "VERTICAL_LINE_DRAWING" // vertical line drawing started
  | "VERTICAL_LINE_SELECTED" // vertical line selected
  | "VERTICAL_LINE_EDITING_TOP" // vertical line handle clicked followin slope line selected
  | "VERTICAL_LINE_EDITING_BOTTOM" // vertical line handle clicked followin slope line selected
  | "SLOPE_LINE_STARTED" // slope line button pressed
  | "SLOPE_LINE_DRAWING" // slope line drawing started
  | "SLOPE_LINE_SELECTED" // slope line selected
  | "SLOPE_LINE_EDITING_LEFT" // slope line handle clicked followin slope line selection
  | "SLOPE_LINE_EDITING_RIGHT" // slope line handle clicked followin slope line selection
  | "CONCAVE_CURVE_STARTED" // concave line button pressed
  | "CONCAVE_CURVE_DRAWING" // concave line drawing started
  | "CONCAVE_CURVE_SELECTED" // concave line selected
  | "CONVEX_CURVE_STARTED" // convex line button pressed
  | "CONVEX_CURVE_DRAWING" // convex line drawing started
  | "CONVEX_CURVE_SELECTED" // convex line selected
  | "SQRT_STARTED" // sqrt button pressed
  | "SQRT_DRAWING" // sqrt drawing started
  | "SQRT_EDITING" // sqrt line handle clicked
  | "SQRT_SELECTED" // sqrt selected
  | "COLORIZING" // color selected
  | "DELETING" // mouse clicked following delete button pressed
  | "AREA_SELECTING" // user started selecting area
  | "AREA_SELECTED" // user finished selecting area
  | "TEXT_AREA_SELECTING" // user started selecting area after click on free text icon
  | "TEXT_AREA_SELECTED" // user finished selecting text area
  | "AREA_MOVING" // user grabbed the selection area after select button pressed
  | "CHECKMARK_STARTED" // checkmark button pressed
  | "SEMICHECKMARK_STARTED" // semicheck button pressed
  | "XMARK_STARTED"; // xmark button pressed

export const EditModeNotationType = new Map<
  EditMode,
  NotationType
>([
  ["SYMBOL", "SYMBOL"],
  ["SPECIAL_SYMBOL", "SYMBOL"],
  ["EXPONENT_STARTED", "EXPONENT"],
  ["EXPONENT_WRITING", "EXPONENT"],
  ["TEXT_STARTED", "TEXT"],
  ["CELL_SELECTED", "SYMBOL"],
  ["HORIZONTAL_LINE_STARTED", "HORIZONTALLINE"],
  ["HORIZONTAL_LINE_DRAWING", "HORIZONTALLINE"],
  ["HORIZONTAL_LINE_SELECTED", "HORIZONTALLINE"],
  [
    "HORIZONTAL_LINE_EDITING_LEFT",
    "HORIZONTALLINE",
  ],
  [
    "HORIZONTAL_LINE_EDITING_RIGHT",
    "HORIZONTALLINE",
  ],
  ["HORIZONTAL_LINE_SELECTED", "HORIZONTALLINE"],
  ["VERTICAL_LINE_STARTED", "VERTICALLINE"],
  ["VERTICAL_LINE_DRAWING", "VERTICALLINE"],
  ["VERTICAL_LINE_SELECTED", "VERTICALLINE"],
  ["VERTICAL_LINE_EDITING_TOP", "VERTICALLINE"],
  [
    "VERTICAL_LINE_EDITING_BOTTOM",
    "VERTICALLINE",
  ],
  ["SLOPE_LINE_STARTED", "SLOPELINE"],
  ["SLOPE_LINE_DRAWING", "SLOPELINE"],
  ["SLOPE_LINE_SELECTED", "SLOPELINE"],
  ["SLOPE_LINE_EDITING_LEFT", "SLOPELINE"],
  ["SLOPE_LINE_EDITING_RIGHT", "SLOPELINE"],
  ["CONCAVE_CURVE_STARTED", "CONCAVECURVE"],
  ["CONCAVE_CURVE_DRAWING", "CONCAVECURVE"],
  ["CONCAVE_CURVE_SELECTED", "CONCAVECURVE"],
  ["CONVEX_CURVE_STARTED", "CONVEXCURVE"],
  ["CONVEX_CURVE_DRAWING", "CONVEXCURVE"],
  ["CONVEX_CURVE_SELECTED", "CONVEXCURVE"],
  ["SQRT_STARTED", "SQRT"],
  ["SQRT_DRAWING", "SQRT"],
  ["SQRT_SELECTED", "SQRT"],
  ["SQRT_EDITING", "SQRT"],
  ["COLORIZING", "SYMBOL"],
  ["DELETING", "SYMBOL"],
  ["AREA_SELECTING", "SYMBOL"],
  ["AREA_SELECTED", "SYMBOL"],
  ["TEXT_AREA_SELECTING", "TEXT"],
  ["TEXT_AREA_SELECTED", "TEXT"],
  ["AREA_MOVING", "SYMBOL"],
  ["CHECKMARK_STARTED", "SYMBOL"],
  ["SEMICHECKMARK_STARTED", "SYMBOL"],
  ["XMARK_STARTED", "SYMBOL"],
]);

export const EditModeCursorType = new Map<
  EditMode,
  CursorType
>([
  ["SYMBOL", "auto"],
  ["SPECIAL_SYMBOL", "auto"],
  ["EXPONENT_STARTED", "auto"],
  ["EXPONENT_WRITING", "auto"],
  ["EXPONENT_SELECTED", "auto"],
  ["TEXT_STARTED", "text"],
  ["TEXT_WRITING", "text"],
  ["CELL_SELECTED", "auto"],
  ["HORIZONTAL_LINE_STARTED", "auto"],
  ["HORIZONTAL_LINE_DRAWING", "auto"],
  ["HORIZONTAL_LINE_EDITING_LEFT", "auto"],
  ["HORIZONTAL_LINE_EDITING_RIGHT", "auto"],
  ["HORIZONTAL_LINE_SELECTED", "auto"],
  ["VERTICAL_LINE_STARTED", "auto"],
  ["VERTICAL_LINE_DRAWING", "auto"],
  ["VERTICAL_LINE_EDITING_BOTTOM", "auto"],
  ["VERTICAL_LINE_EDITING_TOP", "auto"],
  ["VERTICAL_LINE_SELECTED", "auto"],
  ["VERTICAL_LINE_EDITING_BOTTOM", "auto"],
  ["VERTICAL_LINE_EDITING_TOP", "auto"],
  ["SLOPE_LINE_STARTED", "auto"],
  ["SLOPE_LINE_DRAWING", "auto"],
  ["SLOPE_LINE_SELECTED", "auto"],
  ["SLOPE_LINE_EDITING_LEFT", "auto"],
  ["SLOPE_LINE_EDITING_RIGHT", "auto"],
  ["SQRT_STARTED", "auto"],
  ["SQRT_DRAWING", "auto"],
  ["SQRT_SELECTED", "auto"],
  ["SQRT_EDITING", "auto"],
  ["COLORIZING", "auto"],
  ["DELETING", "auto"],
  ["AREA_SELECTING", "auto"],
  ["AREA_SELECTED", "auto"],
  ["AREA_MOVING", "auto"],
  ["TEXT_AREA_SELECTING", "auto"],
  ["TEXT_AREA_SELECTED", "auto"],
  ["CHECKMARK_STARTED", "auto"],
  ["SEMICHECKMARK_STARTED", "auto"],
  ["XMARK_STARTED", "auto"],
]);

export type UserType = "TEACHER" | "STUDENT";

export type SelectionMoveDirection =
  | "LEFT"
  | "RIGHT"
  | "TOP"
  | "BOTTOM"
  | "LEFTTOP"
  | "LEFTBOTTOM"
  | "RIGHTTOP"
  | "RIGHTBOTTOM";

export type Color =
  | "none"
  | "yellow"
  | "lightblue"
  | "lightgreen"
  | "pink"
  | "transparent";

export type LineHandleType  =  
  | "top"
  | "bottom"
  | "right"
  | "left";
