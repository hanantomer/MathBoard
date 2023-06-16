const messagingHost = "http://localhost:3030";

const matrixDimensions = {
  rowsNum: 24,
  colsNum: 44,
};

const signList = ["=", "+", "-", "*", "/", "\\", "(", ")", "[", "]"];

const activeCellColor = "lightcyan";

type PointCoordinates = {col: number, row:number/*, type:string/*TODO: change to enum*/};

type LineCoordinates = {fromCol: number, toCol: number, row:number};

type RectCoordinates = {fromCol: number, toCol: number, fromRow:number, toRow:number};

type Point = {x: number, y:number};

export {messagingHost, activeCellColor, matrixDimensions, signList, PointCoordinates, LineCoordinates, RectCoordinates, Point}
