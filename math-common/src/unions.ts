export const BoardTypeValues = ["LESSON","QUESTION","ANSWER"] as const;

export type BoardType = typeof BoardTypeValues[number];

export type NotationShape = "POINT" |  "HORIZONTAL_LINE" | "VERTICAL_LINE"| "SLOPE_LINE" |  "RECT"

export type PointType = "SYMBOL" |  "EXPONENT" |  "SIGN"

export type LineType = "HORIZONTAL_LINE_STARTED" |  "SQRT" | "VERTICAL_LINE_STARTED" | "SLOPE_LINE_STARTED"

//export type CellPart = "TOP" | "MIDDLE" | "BOTTOM"

export const NotationTypeValues = 
  ["SYMBOL",
  "SIGN",
  "EXPONENT",
  "HORIZONTALLINE",
  "VERTICALLINE",
  "SLOPELINE",
  "SQRT",
  "SQRTSYMBOL",
  "TEXT",
  "IMAGE"] as const;

export type NotationType = typeof NotationTypeValues[number]
  
export const NotationTypeShape = new Map<NotationType, NotationShape> ([
  ["SYMBOL", "POINT"],
  ["SIGN", "POINT"],
  ["EXPONENT", "POINT"],
  ["SQRT", "HORIZONTAL_LINE"],
  ["SQRTSYMBOL", "POINT"],
  ["HORIZONTALLINE", "HORIZONTAL_LINE"],
  ["VERTICALLINE", "VERTICAL_LINE"],
  ["SLOPELINE", "SLOPE_LINE"],
  ["TEXT", "RECT"],
  ["IMAGE", "RECT"],
])

export type EditMode = 
  "SYMBOL"                    | // default mode
  "EXPONENT"                  | // exponent button pressed
  "TEXT"                      | // text button pressed
  "TEXT_WRITING"              | // user clicked a cell following text button pressed
  "CELL_SELECTED"             | // user clicked on a cell or navigated via keys
  "HORIZONTAL_LINE_STARTED"   | // horizontal line button pressed
  "HORIZONTAL_LINE_DRAWING"   | // horizontal line drawing started
  "HORIZONTAL_LINE_SELECTED"  | // horizontal line selected
  "VERTICAL_LINE_STARTED"     | // vertical line button pressed
  "VERTICAL_LINE_DRAWING"     | // vertical line drawing started
  "VERTICAL_LINE_SELECTED"    | // vertical line selected
  "SLOPE_LINE_STARTED"        | // slope line button pressed
  "SLOPE_LINE_DRAWING"        | // slope line drawing started
  "SLOPE_LINE_SELECTED"       | // slope line selected
  "SQRT"                      | // sqrt button pressed
  "SQRT_DRAWING"              | // sqrt drawing started
  "SQRT_SELECTED"             | // sqrt selected  
  "COLORISING"                | // color selected
  "DELETING"                  | // mouse clicked following delete button pressed
  "AREA_SELECTING"            | // user stared selecting area
  "AREA_SELECTED"             | // user finished selecting area
  "MOVING"                    | // user grabbed the selection area after select button pressed
  "CHECKMARK"                 | // checkmark button pressed
  "SEMICHECKMARK"             | // semicheck button pressed
  "XMARK"                     | // xmark button pressed
  "GEO"                         // geometry sketching

  export const EditModeNotationType = new Map<EditMode, NotationType> ([
    ["SYMBOL", "SYMBOL"],                  
    ["EXPONENT", "EXPONENT"],                 
    ["TEXT", "TEXT"],                     
    ["CELL_SELECTED", "SYMBOL"],            
    ["HORIZONTAL_LINE_STARTED", "HORIZONTALLINE"],  
    ["HORIZONTAL_LINE_DRAWING", "HORIZONTALLINE"],  
    ["HORIZONTAL_LINE_SELECTED", "HORIZONTALLINE"], 
    ["VERTICAL_LINE_STARTED", "VERTICALLINE"],    
    ["VERTICAL_LINE_DRAWING", "VERTICALLINE"],    
    ["VERTICAL_LINE_SELECTED", "VERTICALLINE"],   
    ["SLOPE_LINE_STARTED", "SLOPELINE"],       
    ["SLOPE_LINE_DRAWING", "SLOPELINE"],       
    ["SLOPE_LINE_SELECTED", "SLOPELINE"],      
    ["SQRT", "SQRT"],                     
    ["SQRT_DRAWING", "SQRT"],             
    ["SQRT_SELECTED", "SQRT"],            
    ["COLORISING", "SYMBOL"],               
    ["DELETING", "SYMBOL"],                 
    ["AREA_SELECTING", "SYMBOL"],           
    ["AREA_SELECTED", "SYMBOL"],            
    ["MOVING", "SYMBOL"],                   
    ["CHECKMARK", "SYMBOL"],                
    ["SEMICHECKMARK", "SYMBOL"],            
    ["XMARK", "SYMBOL"],                    
    ["GEO", "SYMBOL"],                      
 ])
 

export type UserType = "TEACHER" | "STUDENT"

export type MoveDirection = "LEFT" |  "RIGHT" |  "TOP" |  "BOTTOM" | "LEFTTOP" | "LEFTBOTTOM" | "RIGHTTOP" | "RIGHTBOTTOM"