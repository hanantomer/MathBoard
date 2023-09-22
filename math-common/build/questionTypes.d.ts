import { UserAttributes } from "./userTypes";
import { LessonAttributes } from "./lessonTypes";
import { BaseEntity, BaseNotation, LineAttributes, PointAttributes, RectAttributes } from "./baseTypes";
export interface QuestionAttributes extends BaseEntity {
    name: string;
    user: UserAttributes;
    lesson: LessonAttributes;
}
export type QuestionCreateAttributes = Omit<QuestionAttributes, keyof BaseEntity>;
interface QuestionNotationAttributes {
    question: QuestionAttributes;
}
export interface QuestionLineAttributes extends BaseNotation, LineAttributes, QuestionNotationAttributes {
}
export type QuestionLineCreationAttributes = Omit<QuestionLineAttributes, keyof BaseEntity>;
export interface QuestionPointAttributes extends BaseNotation, PointAttributes, QuestionNotationAttributes {
}
export type QuestionPointCreationAttributes = Omit<QuestionPointAttributes, keyof BaseEntity>;
export interface QuestionRectAttributes extends BaseNotation, RectAttributes, QuestionNotationAttributes {
}
export type QuestionRectCreationAttributes = Omit<QuestionRectAttributes, keyof BaseEntity>;
export {};
