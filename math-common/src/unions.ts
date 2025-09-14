export const BoardTypeValues = [
  "LESSON",
  "QUESTION",
  "ANSWER",
] as const;

export type BoardType =
  (typeof BoardTypeValues)[number];

export type BusEventType =
  | "EV_ALT_CLICK"
  | "EV_QUESTION_SAVED"
  | "EV_COPY"
  | "EV_PASTE"
  | "EV_KEYUP"
  | "EV_KEYDOWN"
  | "EV_MOUSEUP"
  | "EV_SVG_MOUSEUP"
  | "EV_SVG_MOUSEDOWN"
  | "EV_SVG_TOUCH_START"
  | "EV_SVG_MOUSE_OR_TOUCH_DRAG"
  | "EV_AREA_SELECTION_DONE"
  | "EV_CURVE_SELECTED"
  | "EV_CIRCLE_SELECTED"
  | "EV_IMAGE_SELECTED"
  | "EV_TEXT_SELECTED"
  | "EV_TEXT_EDITING"
  | "EV_ANNOTATION_SELECTED"
  | "EV_SPECIAL_SYMBOL_SELECTED"
  | "EV_SQRT_SELECTED"
  | "EV_LINE_CHANGED"
  | "EV_LINE_SELECTED";

export const NotationTypeValues = [
  "SYMBOL",
  "SIGN",
  "LOGBASE",
  "EXPONENT",
  "POLYGON",
  "LINE",
  "CURVE",
  "CIRCLE",
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

export type EditMode =
  | "LESSONS_SELECTION" //  after click on lessons icon
  | "QUESTIONS_SELECTION" //  after click on questions icon
  | "ANSWERS_SELECTION" //  after click on answers icon
  | "SPECIAL_SYMBOL_SELECTED" // special symbol in bottom toolbar pressed
  | "LOG_STARTED" // log button pressed
  | "EXPONENT_STARTED" // exponent button pressed
  | "EXPONENT_WRITING" // user clicked a cell following exponent button pressed
  | "EXPONENT_SELECTED" // user clicked on existing exponent
  | "TEXT_STARTED" // text button pressed
  | "TEXT_SELECTED" // user clicked on existing text rectangle
  | "TEXT_AREA_SELECTING" // user started selecting area following text button pressed
  | "TEXT_WRITING" // user clicked a cell following text button pressed
  | "IMAGE_SELECTED" // user clicked on existing image
  | "RESIZE_STARTED" // user clicked on existing rect and clicked on resize handle
  | "RESIZING" // user clicked on existing rect  and is resizing
  | "ANNOTATION_STARTED" // annotation button pressed
  | "ANNOTATION_SELECTED" // user clicked on existing annotation rectangle
  | "ANNOTATION_WRITING" // user clicked a cell following annotation button pressed
  | "CELL_SELECTED" // user clicked on a cell or navigated via keys
  | "POLYGON_STARTED" // polygon button pressed
  | "POLYGON_DRAWING" // polygon drawing started
  //| "POLYGON_LINE_ENDED" // polygon single line ended
  | "LINE_STARTED" //  line button pressed
  | "LINE_DRAWING" // line drawing started
  | "LINE_SELECTED" // line selected
  | "LINE_EDITING_LEFT" // slope line handle clicked followin slope line selection
  | "LINE_EDITING_RIGHT" // slope line handle clicked followin slope line selection
  | "CURVE_STARTED" // curve button pressed
  | "CURVE_DRAWING" // curve drawing started
  | "CURVE_SELECTED" // curve selected
  | "CURVE_EDITING_LEFT" //   curve left handle clicked
  | "CURVE_EDITING_RIGHT" //  curve right handle clicked
  | "CURVE_EDITING_CONTROLֹ_POINT" //  curve control point clicked
  | "CIRCLE_STARTED" // circle button pressed
  | "CIRCLE_DRAWING" // circle drawing started
  | "CIRCLE_SELECTED" // circle selected
  | "CIRCLE_EDITING" // circle left handle clicked
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
  ["SPECIAL_SYMBOL_SELECTED", "SYMBOL"],
  ["EXPONENT_STARTED", "EXPONENT"],
  ["EXPONENT_WRITING", "EXPONENT"],
  ["TEXT_STARTED", "TEXT"],
  ["CELL_SELECTED", "SYMBOL"],
  ["POLYGON_STARTED", "POLYGON"],
  ["POLYGON_DRAWING", "POLYGON"],
  ["LINE_STARTED", "LINE"],
  ["LINE_DRAWING", "LINE"],
  ["LINE_SELECTED", "LINE"],
  ["LINE_EDITING_LEFT", "LINE"],
  ["LINE_EDITING_RIGHT", "LINE"],
  ["CURVE_STARTED", "CURVE"],
  ["CURVE_DRAWING", "CURVE"],
  ["CURVE_SELECTED", "CURVE"],
  ["CURVE_EDITING_LEFT", "CURVE"],
  ["CURVE_EDITING_RIGHT", "CURVE"],
  ["CURVE_EDITING_CONTROLֹ_POINT", "CURVE"],
  ["CIRCLE_STARTED", "CIRCLE"],
  ["CIRCLE_DRAWING", "CIRCLE"],
  ["CIRCLE_SELECTED", "CIRCLE"],
  ["CIRCLE_EDITING", "CIRCLE"],
  ["CURVE_EDITING_CONTROLֹ_POINT", "CURVE"],
  ["TEXT_WRITING", "TEXT"],
  ["TEXT_SELECTED", "TEXT"],
  ["IMAGE_SELECTED", "IMAGE"],
  ["ANNOTATION_STARTED", "ANNOTATION"],
  ["ANNOTATION_SELECTED", "ANNOTATION"],
  ["ANNOTATION_WRITING", "ANNOTATION"],
  ["TEXT_AREA_SELECTING", "TEXT"],
  ["TEXT_AREA_SELECTED", "TEXT"],
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
  ["SPECIAL_SYMBOL_SELECTED", "auto"],
  ["EXPONENT_STARTED", "auto"],
  ["EXPONENT_WRITING", "auto"],
  ["EXPONENT_SELECTED", "auto"],
  ["TEXT_STARTED", "text"],
  ["TEXT_WRITING", "text"],
  ["CELL_SELECTED", "auto"],
  ["POLYGON_STARTED", "auto"],
  ["LINE_STARTED", "auto"],
  ["LINE_DRAWING", "auto"],
  ["LINE_SELECTED", "auto"],
  ["LINE_EDITING_LEFT", "auto"],
  ["LINE_EDITING_RIGHT", "auto"],
  ["SQRT_STARTED", "auto"],
  ["SQRT_DRAWING", "auto"],
  ["SQRT_SELECTED", "auto"],
  ["SQRT_EDITING", "auto"],
  ["COLORIZING", "auto"],
  ["DELETING", "auto"],
  ["AREA_SELECTING", "auto"],
  ["AREA_SELECTED", "auto"],
  ["RESIZE_STARTED", "grabbing"],
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
  | "gray"
  | "lightgray"
  | "darkgray"
  | "ciyan"
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "red"
  | "yellow"
  | "lightblue"
  | "lightgreen"
  | "pink"
  | "transparent";

export type LineHandleType =
  | "top"
  | "bottom"
  | "right"
  | "left";
