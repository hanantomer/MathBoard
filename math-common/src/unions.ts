export const BoardTypeValues = ["LESSON","QUESTION","ANSWER"] as const;

export type BoardType = typeof BoardTypeValues[number];

export type NotationShape = "POINT" |  "LINE" |  "RECT"

export const NotationTypeValues = ["SYMBOL","SIGN","POWER","FRACTION","SQRT","SQRTSYMBOL","TEXT","IMAGE","GEO"] as const;

export type NotationType = typeof NotationTypeValues[number]
  
export const NotationTypeShape = new Map<NotationType, NotationShape> ([
  ["SYMBOL", "POINT"],
  ["SIGN", "POINT"],
  ["POWER", "POINT"],
  ["SQRT", "LINE"],
  ["SQRTSYMBOL", "LINE"],
  ["FRACTION", "LINE"],
  ["TEXT", "RECT"],
  ["IMAGE", "RECT"],
  ["GEO", "RECT"]
])

export const NotationTypeEditMode = new Map<NotationType, EditMode> ([
  ["SYMBOL", "SYMBOL"],
  ["FRACTION", "FRACTION"],
  ["SQRT", "SQRT"],
  ["TEXT", "TEXT"],
])


export type EditMode = 
  "SYMBOL"            | // default mode
  "POWER"             | // power button pressed
  "TEXT"              | // text button pressed
  "CELL_SELECTED"     | // user clicked on a cell or navigated via keys
  "FRACTION"          | // fraction button pressed
  "FRACTION_DRAWING"  | // fraction drawing started
  "FRACTION_SELECTING"| // fraction selecting
  "FRACTION_SELECTED" | // fraction selected
  "FRACTION_EDITITING"| // fraction selected and edit started
  "SQRT"              | // sqrt button pressed
  "SQRT_DRAWING"      | // sqrt drawing started
  "SQRT_SELECTING"    | // sqrt selected
  "SQRT_EDITITING"    | // sqrt selected and edit started
  "SQRT_SELECTED"     | // sqrt selected  
  "DELETING"          | // mouse clicked following delete button pressed
  "AREA_SELECT"       | // select button pressed
  "AREA_SELECTING"    | // user stared selecting area
  "AREA_SELECTED"     | // user finished selecting area
  "MOVING"            | // user grabbed the selection area after select button pressed
  "CHECKMARK"         | // checkmark button pressed
  "SEMICHECKMARK"     | // semicheck button pressed
  "XMARK"               // xmark button pressed

export type UesrType = "TEACHER" | "STUDENT"

export type LoginType = "LOGIN" | "REGISTER"



