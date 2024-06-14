import { QuestionAttributes } from "./questionTypes";
import { 
  HorizontalLineAttributes, 
  VerticalLineAttributes, 
  SlopeLineAttributes, 
  CurveAttributes, 
  CellAttributes, 
  RectAttributes, 
  SingleValueAttributes,
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

export type  AnswerHorizontalLineAttributes = EntityAttributes & NotationAttributes & HorizontalLineAttributes &  AnswerNotationAttributes;

export type AnswerHorizontalLineCreationAttributes = Omit<AnswerHorizontalLineAttributes, keyof EntityAttributes> 

export type  AnswerVerticalLineAttributes = EntityAttributes & NotationAttributes & VerticalLineAttributes &  AnswerNotationAttributes;

export type AnswerVerticalLineCreationAttributes = Omit<AnswerVerticalLineAttributes, keyof EntityAttributes> 

export type  AnswerSlopeLineAttributes = EntityAttributes & NotationAttributes & SlopeLineAttributes &  AnswerNotationAttributes;

export type AnswerSlopeLineCreationAttributes = Omit<AnswerSlopeLineAttributes, keyof EntityAttributes> 

export type  AnswerCurveAttributes = EntityAttributes & NotationAttributes & CurveAttributes &  AnswerNotationAttributes;

export type AnswerCurveCreationAttributes = Omit<AnswerCurveAttributes, keyof EntityAttributes> 
  
// point

export type AnswerPointAttributes = EntityAttributes & NotationAttributes & CellAttributes &  AnswerNotationAttributes & SingleValueAttributes;

export type AnswerPointCreationAttributes = Omit<AnswerPointAttributes, keyof EntityAttributes>     

// rect

export type AnswerRectAttributes = EntityAttributes & NotationAttributes & RectAttributes &  AnswerNotationAttributes;

export type AnswerRectCreationAttributes = Omit<AnswerRectAttributes, keyof EntityAttributes>     

// exponent

//export type AnswerExponentAttributes = EntityAttributes & NotationAttributes & CellAttributes & ExponentAttributes &  AnswerNotationAttributes;

//export type AnswerExponentCreationAttributes = Omit<AnswerExponentAttributes, keyof EntityAttributes>     


