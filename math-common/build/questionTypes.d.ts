import { LessonAttributes } from "./lessonTypes";
import { LineAttributes, PointAttributes, RectAttributes, SingleValueAttributes, BoardAttributes, EntityAttributes, NotationAttributes } from "./baseTypes";
export type QuestionAttributes = EntityAttributes & BoardAttributes & {
    lesson: LessonAttributes;
    lessonId: number;
};
export type QuestionCreateAttributes = Omit<QuestionAttributes, keyof EntityAttributes>;
type QuestionNotationAttributes = {
    question: QuestionAttributes;
};
export type QuestionLineAttributes = EntityAttributes & NotationAttributes & LineAttributes & QuestionNotationAttributes;
export type QuestionLineCreationAttributes = Omit<QuestionLineAttributes, keyof EntityAttributes>;
export type QuestionPointAttributes = EntityAttributes & NotationAttributes & PointAttributes & QuestionNotationAttributes & SingleValueAttributes;
export type QuestionPointCreationAttributes = Omit<QuestionPointAttributes, keyof EntityAttributes>;
export type QuestionRectAttributes = EntityAttributes & NotationAttributes & RectAttributes & QuestionNotationAttributes;
export type QuestionRectCreationAttributes = Omit<QuestionRectAttributes, keyof EntityAttributes>;
export {};
