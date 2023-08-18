export declare const messagingHost = "http://localhost:3030";
export declare const apiHost = "http://localhost:8080";
export declare const matrixDimensions: {
    rowsNum: number;
    colsNum: number;
};
export declare const signList: string[];
export declare const activeCellColor = "lightcyan";
export declare const heartBeatInterval = 5000;
export type CellCoordinates = {
    col: number;
    row: number;
};
export type DotPosition = {
    x: number;
    y: number;
};
export type LinePosition = {
    x1: number;
    x2: number;
    y: number;
};
export declare function getDefaultFontSize(): number;
