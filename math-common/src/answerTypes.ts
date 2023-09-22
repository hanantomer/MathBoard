import { UserAttributes } from "./userTypes";
import { QuestionAttributes } from "./questionTypes";
import { BaseEntity, BaseNotation, LineAttributes, PointAttributes, RectAttributes } from "./baseTypes";

// answer

export interface AnswerAttributes extends BaseEntity{
  name: string;
  user: UserAttributes;
  question: QuestionAttributes;
}

export type AnswerCreateAttributes = Omit<AnswerAttributes, keyof BaseEntity> 

// answer notations

interface AnswerNotationAttributes {
  answer: AnswerAttributes;
}

// line

export interface AnswerLineAttributes extends 
    BaseNotation,
    LineAttributes,
    AnswerNotationAttributes {}

export type AnswerLineCreationAttributes = Omit<AnswerLineAttributes, keyof BaseEntity> 
  
// point

export interface AnswerPointAttributes extends 
    BaseNotation,
    PointAttributes,
    AnswerNotationAttributes {}

export type AnswerPointCreationAttributes = Omit<AnswerPointAttributes, keyof BaseEntity>     

// rect

export interface AnswerRectAttributes extends 
    BaseNotation,
    RectAttributes,
    AnswerNotationAttributes {}

export type AnswerRectCreationAttributes = Omit<AnswerRectAttributes, keyof BaseEntity>         

