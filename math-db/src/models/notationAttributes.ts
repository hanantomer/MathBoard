import { BaseNotation, BaseCreateNotation } from "./baseNotation";
import { PointAttributes } from "./pointAttributes";
import { LineAttributes } from "./lineAttributes";
import { RectAttributes } from "./rectAttributes";

export type PointNotationAttributes = BaseNotation & PointAttributes;
export type LineNotationAttributes = BaseNotation & LineAttributes;
export type RectNotationAttributes = BaseNotation & RectAttributes;
export type TextNotationAttributes = BaseNotation & RectAttributes;

export type PointNotationCreateAttributes = BaseCreateNotation & PointAttributes;
export type LineNotationCreateAttributes = BaseCreateNotation & LineAttributes;
export type RectNotationCreateAttributes = BaseCreateNotation & RectAttributes;
export type TextNotationCreateAttributes = BaseCreateNotation & RectAttributes;