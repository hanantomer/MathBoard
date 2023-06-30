const messagingHost = "http://localhost:3030";
const apiHost = "http://localhost:8080";

const matrixDimensions = {
  rowsNum: 24,
  colsNum: 44,
};

const signList = ["=", "+", "-", "*", "/", "\\", "(", ")", "[", "]"];

const activeCellColor = "lightcyan";

type CellCoordinates = {col: number, row:number};

type LineCoordinates = {fromCol: number, toCol: number, row:number};

type RectCoordinates = {fromCol: number, toCol: number, fromRow:number, toRow:number};

type Point = {x: number, y:number};

export {messagingHost, apiHost, activeCellColor, matrixDimensions, signList, CellCoordinates, LineCoordinates, RectCoordinates, Point}
