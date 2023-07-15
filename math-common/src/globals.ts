const messagingHost = "http://localhost:3030";
const apiHost = "http://localhost:8080";

const matrixDimensions = {
  rowsNum: 24,
  colsNum: 44,
};

const signList = ["=", "+", "-", "*", "/", "\\", "(", ")", "[", "]"];

const activeCellColor = "lightcyan";

const heartBeatInterval = 5000;

type CellCoordinates = {col: number, row:number};

type LineCoordinates = {fromCol: number, toCol: number, row:number};

type RectCoordinates = {fromCol: number, toCol: number, fromRow:number, toRow:number};

type DotPosition = {x: number, y:number};

type LinePosition =  {
  x1: number;
  x2: number;
  y: number;
};


function getDefaultFontSize() : number {
  var style  = 
    window!.getComputedStyle(document!.body)!;

  var fs = style.getPropertyValue('font-size')!;
  let regex = fs.match(/\d+/);
  return Number(regex?.[0]);
};
    
 

export {
  heartBeatInterval, 
  messagingHost, 
  apiHost, 
  activeCellColor, 
  matrixDimensions, 
  signList, 
  CellCoordinates, 
  LineCoordinates, 
  RectCoordinates, 
  DotPosition as Point,
  getDefaultFontSize,
  LinePosition,
  DotPosition
}
