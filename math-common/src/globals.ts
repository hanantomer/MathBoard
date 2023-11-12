//export const messagingHost = "/msg";  // see proxy configuration in vite.config.ts
//export const apiHost = "/api";
export const matrixDimensions = {
  rowsNum: 24,
  colsNum: 44,
};

export const signList = ["=", "+", "-", "*", "/", "\\", "(", ")", "[", "]"];

export const selectedCellColor = "lightcyan";

export const heartBeatInterval = 5000;

export type CellCoordinates = {col: number, row:number};

//export type LineCoordinates = {fromCol: number, toCol: number, row:number};

//export type RectCoordinates = {fromCol: number, toCol: number, fromRow:number, toRow:number};

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
    
 

