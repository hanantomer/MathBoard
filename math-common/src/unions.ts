export const BoardTypeValues = ["LESSON","QUESTION","ANSWER"] as const;

export type BoardType = typeof BoardTypeValues[number];

export type BusEventType = 
    "EV_QUESTION_SAVED"           |
    "EV_EXPONENT_SUBMITED"        |
    "EV_CELL_COLORIZED"           |
    "EV_COPY"                     |
    "EV_PASTE"                    |
    "EV_KEYUP"                    | 
    "EV_SVG_MOUSEUP"              |  
    "EV_SVG_MOUSEDOWN"            | 
    "EV_SVG_MOUSECLICK"           | 
    "EV_SVG_MOUSEMOVE"            |  
    "EV_SELECTION_DONE"           | 
    "EV_FREE_TEXT_SUBMITTED"      |
    "EV_FREE_TEXT_SELECTED"       |
    "EV_ANNOTATION_SUBMITTED"     |
    "EV_ANNOTATION_SELECTED"      |
    "EV_EXPONENT_SUBMITTED"       |
    "EV_EXPONENT_SELECTED"        |
    "EV_SLOPE_LINE_SELECTED"      |
    "EV_CONCAVE_CURVE_SELECTED"   |
    "EV_CONVEX_CURVE_SELECTED"    |
    "EV_VERTICAL_LINE_SELECTED"   |
    "EV_SQRT_SELECTED"            |
    "EV_HORIZONTAL_LINE_SELECTED";

export type NotationShape = 
    "POINT"           |  
    "HORIZONTAL_LINE" | 
    "VERTICAL_LINE"   | 
    "SLOPE_LINE"      | 
    "CONCAVE_CURVE"   | 
    "CONVEX_CURVE"    | 
    "RECT";

export const NotationTypeValues = 
  ["SYMBOL",
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
  "IMAGE"] as const;

export type NotationType = typeof NotationTypeValues[number]

export type CursorType =
    "auto" |
    "default" |
    "grab" |
    "grabbing"|
    "help"|
    "move"|
    "none"|
    "not-allowed"|
    "pointer"|
    "progress"|
    "text"|
    "wait"
  
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
  ["ANNOTATION", "HORIZONTAL_LINE"],
  ["IMAGE", "RECT"],
  ["CONCAVECURVE", "CONCAVE_CURVE"],
  ["CONVEXCURVE", "CONVEX_CURVE"],
])

export type EditMode = 
  "LESSONS_SELECTION"         | //  after click on lessons icon
  "QUESTIONS_SELECTION"       | //  after click on questions icon
  "ANSWERS_SELECTION"         | //  after click on answers icon
  "SYMBOL"                    | // default mode
  "EXPONENT_STARTED"          | // exponent button pressed
  "EXPONENT_WRITING"          | // user clicked a cell following exponent button pressed
  "EXPONENT_SELECTED"         | // user clicked on existing exponent
  "TEXT_STARTED"              | // text button pressed
  "TEXT_SELECTED"             | // user clicked on existing text rectangle
  "TEXT_AREA_SELECTING"       | // user started selecting area following text button pressed
  "TEXT_WRITING"              | // user clicked a cell following text button pressed
  "ANNOTATION_STARTED"        | // annotation button pressed
  "ANNOTATION_SELECTED"       | // user clicked on existing annotation rectangle
  "ANNOTATION_AREA_SELECTING" | // user started selecting area following annotation button pressed
  "ANNOTATION_WRITING"        | // user clicked a cell following annotation button pressed
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
  "CONCAVE_CURVE_STARTED"     | // concave line button pressed
  "CONCAVE_CURVE_DRAWING"     | // concave line drawing started
  "CONCAVE_CURVE_SELECTED"    | // concave line selected
  "CONVEX_CURVE_STARTED"      | // convex line button pressed
  "CONVEX_CURVE_DRAWING"      | // convex line drawing started
  "CONVEX_CURVE_SELECTED"     | // convex line selected
  "SQRT_STARTED"              | // sqrt button pressed
  "SQRT_DRAWING"              | // sqrt drawing started
  "SQRT_SELECTED"             | // sqrt selected  
  "COLORISING"                | // color selected
  "DELETING"                  | // mouse clicked following delete button pressed
  "AREA_SELECTING"            | // user started selecting area
  "AREA_SELECTED"             | // user finished selecting area
  "MOVING"                    | // user grabbed the selection area after select button pressed
  "CHECKMARK_STARTED"         | // checkmark button pressed
  "SEMICHECKMARK_STARTED"     | // semicheck button pressed
  "XMARK_STARTED"               // xmark button pressed
  

  export const EditModeNotationType = new Map<EditMode, NotationType> ([
    ["SYMBOL", "SYMBOL"],                  
    ["EXPONENT_STARTED", "EXPONENT"],
    ["EXPONENT_WRITING", "EXPONENT"],                                  
    ["TEXT_STARTED", "TEXT"],                     
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
    ["CONCAVE_CURVE_STARTED", "CONCAVECURVE"],       
    ["CONCAVE_CURVE_DRAWING", "CONCAVECURVE"],       
    ["CONCAVE_CURVE_SELECTED", "CONCAVECURVE"],      
    ["CONVEX_CURVE_STARTED", "CONVEXCURVE"],       
    ["CONVEX_CURVE_DRAWING", "CONVEXCURVE"],       
    ["CONVEX_CURVE_SELECTED", "CONVEXCURVE"],      
    ["SQRT_STARTED", "SQRT"],                     
    ["SQRT_DRAWING", "SQRT"],             
    ["SQRT_SELECTED", "SQRT"],            
    ["COLORISING", "SYMBOL"],               
    ["DELETING", "SYMBOL"],                 
    ["AREA_SELECTING", "SYMBOL"],           
    ["AREA_SELECTED", "SYMBOL"],            
    ["MOVING", "SYMBOL"],                   
    ["CHECKMARK_STARTED", "SYMBOL"],                
    ["SEMICHECKMARK_STARTED", "SYMBOL"],            
    ["XMARK_STARTED", "SYMBOL"]                    
 ])

 export const EditModeCursorType = new Map<EditMode, CursorType> ([
  ["SYMBOL", "auto"],                  
  ["EXPONENT_STARTED", "auto"],                 
  ["EXPONENT_WRITING", "auto"],                 
  ["EXPONENT_SELECTED", "auto"],                 
  ["TEXT_STARTED", "text"],                     
  ["TEXT_WRITING", "text"],
  ["CELL_SELECTED", "auto"],            
  ["HORIZONTAL_LINE_STARTED", "auto"],  
  ["HORIZONTAL_LINE_DRAWING", "auto"],  
  ["HORIZONTAL_LINE_SELECTED", "auto"], 
  ["VERTICAL_LINE_STARTED", "auto"],    
  ["VERTICAL_LINE_DRAWING", "auto"],    
  ["VERTICAL_LINE_SELECTED", "auto"],   
  ["SLOPE_LINE_STARTED", "auto"],       
  ["SLOPE_LINE_DRAWING", "auto"],       
  ["SLOPE_LINE_SELECTED", "auto"],      
  ["SQRT_STARTED", "auto"],                     
  ["SQRT_DRAWING", "auto"],             
  ["SQRT_SELECTED", "auto"],            
  ["COLORISING", "auto"],               
  ["DELETING", "auto"],                 
  ["AREA_SELECTING", "auto"],           
  ["AREA_SELECTED", "auto"],            
  ["MOVING", "auto"],                   
  ["CHECKMARK_STARTED", "auto"],                
  ["SEMICHECKMARK_STARTED", "auto"],            
  ["XMARK_STARTED", "auto"],                    
])


  
export type UserType = "TEACHER" | "STUDENT"

export type MoveDirection = "LEFT" |  "RIGHT" |  "TOP" |  "BOTTOM" | "LEFTTOP" | "LEFTBOTTOM" | "RIGHTTOP" | "RIGHTBOTTOM"