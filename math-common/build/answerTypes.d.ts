import { UserAttributes } from "./userTypes";
import { QuestionAttributes } from "./questionTypes";
import { BaseEntity, BaseNotation, LineAttributes, PointAttributes, RectAttributes } from "./baseTypes";
export interface AnswerAttributes extends BaseEntity {
    name: string;
    user: UserAttributes;
    question: QuestionAttributes;
}
export type AnswerCreateAttributes = Omit<AnswerAttributes, keyof BaseEntity>;
interface AnswerNotationAttributes {
    answer: AnswerAttributes;
}
export interface AnswerLineAttributes extends BaseNotation, LineAttributes, AnswerNotationAttributes {
}
export type AnswerLineCreationAttributes = Omit<AnswerLineAttributes, keyof BaseEntity>;
export interface AnswerPointAttributes extends BaseNotation, PointAttributes, AnswerNotationAttributes {
}
export type AnswerPointCreationAttributes = Omit<AnswerPointAttributes, keyof BaseEntity>;
export interface AnswerRectAttributes extends BaseNotation, RectAttributes, AnswerNotationAttributes {
}
export type AnswerRectCreationAttributes = Omit<AnswerRectAttributes, keyof BaseEntity>;
export {};
