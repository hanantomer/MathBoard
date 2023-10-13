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
  ["FRACTION", "LINE"],
  ["TEXT", "RECT"],
  ["IMAGE", "RECT"],
  ["GEO", "RECT"]
])

export type  AreaSelectionMode = "SELECTING" | "MOVE"

export type EditMode = 
  "SYMBOL" | "POWER" |  "TEXT" |  "FRACTION" |  "SQRT"|  
  "DELETING"      | // mouse clicked following delete button pressed
  "SELECT"        | //  after select button pressed
  "CHECKMARK"     | // after checkmark button pressed
  "SEMICHECKMARK" | // after semicheck button pressed
  "XMARK" // after xmark button pressed

export type UesrType = "TEACHER" | "STUDENT"

export type LoginType = "LOGIN" | "REGISTER"



