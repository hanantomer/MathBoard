//export const messagingHost = "/msg";  // see proxy configuration in vite.config.ts
//export const apiHost = "/api";
export const matrixDimensions = {
  rowsNum: 24,
  colsNum: 96,
};

export const selectionColor = "chocolate";

export const lineColor = "darkblue" 

export const cellSpace = 1;

export const signList = ["=", "+", "-", "*", "/", "\\", "(", ")", "[", "]"];

export const selectedCellStroke = "red";
export const defaultdCellStroke = "lightgray";

export const heartBeatInterval = 5000;

export type DotPosition = {x: number, y:number};

export type ScreenCoordinates = {x1: number, y1:number, x2: number, y2:number};

export type HorizontaLinePosition =  {
  x1: number,
  x2: number,
  y: number;
};

export type VerticalLinePosition =  {
  x: number,
  y1: number,
  y2: number;
};

// if y of left DotPosition is less than y of right DotPosition slope is positive and vice versa
export type SlopeLinePosition =  {
  left: DotPosition, 
  right: DotPosition
};

export type CurvePosition =  {
  left: DotPosition, 
  right: DotPosition,
  controlPoint1: DotPosition,
  controlPoint2: DotPosition
};



export function getDefaultFontSize() : number {
  var style  = 
    window!.getComputedStyle(document!.body)!;

  var fs = style.getPropertyValue('font-size')!;
  let regex = fs.match(/\d+/);
  return Number(regex?.[0]);
};

export function formatDate(date : Date| null | undefined) {
  return date  ? new Date(date).toLocaleDateString("en-us", {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : ""
}
    
 

