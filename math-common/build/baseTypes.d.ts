import { BoardType, NotationType } from "./enum";
import { UserAttributes } from "./userTypes";
export interface BaseEntity {
    id: number;
    uuid: string;
    createdAt: Date;
}
export interface BaseNotation extends BaseEntity {
    user: UserAttributes;
    notationType: NotationType;
    boardType: BoardType;
}
export type Point = {
    col: number;
    row: number;
};
export type Line = {
    fromCol: number;
    toCol: number;
    row: number;
};
export type Rect = {
    fromCol: number;
    fromRow: number;
    toCol: number;
    toRow: number;
};
export interface RectAttributes {
    fromCol: number;
    toCol: number;
    fromRow: number;
    toRow: number;
    value: string;
}
export interface LineAttributes {
    fromCol: number;
    toCol: number;
    row: number;
}
export interface PointAttributes {
    col: number;
    row: number;
    value: string;
}
export type PointNotationAttributes = BaseNotation & PointAttributes;
export type LineNotationAttributes = BaseNotation & LineAttributes;
export type RectNotationAttributes = BaseNotation & RectAttributes;
