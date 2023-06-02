const matrixDimensions = {
  rowsNum: 24,
  colsNum: 44,
};

const signList = ["=", "+", "-", "*", "/", "\\", "(", ")", "[", "]"] 

type PointCoordinates = {col: number, row:number}
type LineCoordinates = {fromCol: number, toCol: number, row:number}
type RectCoordinates = {fromCol: number, toCol: number, fromRow:number, toRow:number}

export {matrixDimensions, signList, PointCoordinates, LineCoordinates, RectCoordinates}
