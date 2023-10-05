import { QuestionAttributes } from "./questionTypes";
import { LineAttributes, PointAttributes, RectAttributes, SingleValueAttributes, BoardAttributes, EntityAttributes, NotationAttributes } from "./baseTypes";
export type AnswerAttributes = EntityAttributes & BoardAttributes & {
    question: QuestionAttributes;
};
export type AnswerCreateAttributes = Omit<AnswerAttributes, keyof EntityAttributes>;
type AnswerNotationAttributes = {
    answer: AnswerAttributes;
};
export type AnswerLineAttributes = EntityAttributes & NotationAttributes & LineAttributes & AnswerNotationAttributes;
export type AnswerLineCreationAttributes = Omit<AnswerLineAttributes, keyof EntityAttributes>;
export type AnswerPointAttributes = EntityAttributes & NotationAttributes & PointAttributes & AnswerNotationAttributes & SingleValueAttributes;
export type AnswerPointCreationAttributes = Omit<AnswerPointAttributes, keyof EntityAttributes>;
export type AnswerRectAttributes = EntityAttributes & NotationAttributes & RectAttributes & AnswerNotationAttributes;
export type AnswerRectCreationAttributes = Omit<AnswerRectAttributes, keyof EntityAttributes>;
export {};
