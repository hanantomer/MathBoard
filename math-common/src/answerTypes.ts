import { QuestionAttributes } from "./questionTypes";
import { 
  LineAttributes, 
  CellAttributes, 
  RectAttributes, 
  SingleValueAttributes,
  ExponentAttributes,
  BoardAttributes,
  EntityAttributes,
  NotationAttributes
} from "./baseTypes";

// answer

export type AnswerAttributes = EntityAttributes & BoardAttributes & {
  question: QuestionAttributes;
}

export type AnswerCreationAttributes = Omit<AnswerAttributes, keyof EntityAttributes>

// every answer notations has an answer as parent

type AnswerNotationAttributes = {
  answer: AnswerAttributes;
}

// line

export type  AnswerLineAttributes = EntityAttributes & NotationAttributes & LineAttributes &  AnswerNotationAttributes;

export type AnswerLineCreationAttributes = Omit<AnswerLineAttributes, keyof EntityAttributes> 
  
// point

export type AnswerPointAttributes = EntityAttributes & NotationAttributes & CellAttributes &  AnswerNotationAttributes & SingleValueAttributes;

export type AnswerPointCreationAttributes = Omit<AnswerPointAttributes, keyof EntityAttributes>     

// rect

export type AnswerRectAttributes = EntityAttributes & NotationAttributes & RectAttributes &  AnswerNotationAttributes;

export type AnswerRectCreationAttributes = Omit<AnswerRectAttributes, keyof EntityAttributes>     

// exponent

export type AnswerExponentAttributes = EntityAttributes & NotationAttributes & CellAttributes & ExponentAttributes &  AnswerNotationAttributes;

export type AnswerExponentCreationAttributes = Omit<AnswerExponentAttributes, keyof EntityAttributes>     


