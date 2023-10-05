import { LineAttributes, PointAttributes, RectAttributes, SingleValueAttributes, BoardAttributes, EntityAttributes, NotationAttributes } from "./baseTypes";
export type LessonAttributes = EntityAttributes & BoardAttributes;
export type LessonCreationAttributes = Omit<LessonAttributes, keyof EntityAttributes>;
export type LessonLineAttributes = EntityAttributes & NotationAttributes & LineAttributes;
export type LessonLineCreationAttributes = Omit<LessonLineAttributes, keyof EntityAttributes>;
export type LessonPointAttributes = EntityAttributes & NotationAttributes & PointAttributes & SingleValueAttributes;
export type LessonPointCreationAttributes = Omit<LessonPointAttributes, keyof EntityAttributes>;
export type LessonRectAttributes = EntityAttributes & NotationAttributes & RectAttributes;
export type LessonRectCreationAttributes = Omit<LessonRectAttributes, keyof EntityAttributes>;
