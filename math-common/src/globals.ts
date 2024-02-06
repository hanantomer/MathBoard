//export const messagingHost = "/msg";  // see proxy configuration in vite.config.ts
//export const apiHost = "/api";
export const matrixDimensions = {
  rowsNum: 24,
  colsNum: 96,
};

export const signList = ["=", "+", "-", "*", "/", "\\", "(", ")", "[", "]"];

export const selectedCellStroke = "red";
export const defaultdCellStroke = "lightgray";
//export const selectedCellStrokeWidth = "2";

export const heartBeatInterval = 5000;

//export type PointAttributes = {col: number, row: number};

export type DotPosition = {x: number, y:number};

export type LinePosition =  {
  x1: number;
  x2: number;
  y: number;
};



export function getDefaultFontSize() : number {
  var style  = 
    window!.getComputedStyle(document!.body)!;

  var fs = style.getPropertyValue('font-size')!;
  let regex = fs.match(/\d+/);
  return Number(regex?.[0]);
};
    
 

