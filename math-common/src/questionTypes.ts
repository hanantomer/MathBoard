import { LessonAttributes } from "./lessonTypes";
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

// question

export type QuestionAttributes = EntityAttributes & BoardAttributes & {

  lesson: LessonAttributes;
}

export type QuestionCreationAttributes =  Omit<QuestionAttributes, keyof EntityAttributes>

// every question notations has a lesson as parent

type QuestionNotationAttributes = {
  question: QuestionAttributes;
}

// line

export type  QuestionHorizontalLineAttributes = EntityAttributes & NotationAttributes & HorizontalLineAttributes &  QuestionNotationAttributes;

export type QuestionHorizontalLineCreationAttributes = Omit<QuestionHorizontalLineAttributes, keyof EntityAttributes> 

export type  QuestionVerticalLineAttributes = EntityAttributes & NotationAttributes & VerticalLineAttributes &  QuestionNotationAttributes;

export type QuestionVerticalLineCreationAttributes = Omit<QuestionVerticalLineAttributes, keyof EntityAttributes> 

export type  QuestionSlopeLineAttributes = EntityAttributes & NotationAttributes & SlopeLineAttributes &  QuestionNotationAttributes;

export type QuestionSlopeLineCreationAttributes = Omit<QuestionSlopeLineAttributes, keyof EntityAttributes> 

export type QuestionCurveAttributes = EntityAttributes & NotationAttributes & CurveAttributes &  QuestionNotationAttributes;

export type QuestionCurveCreationAttributes = Omit<QuestionCurveAttributes, keyof EntityAttributes> 

  
// point

export type QuestionPointAttributes = EntityAttributes & NotationAttributes & CellAttributes &  QuestionNotationAttributes & SingleValueAttributes;

export type QuestionPointCreationAttributes = Omit<QuestionPointAttributes, keyof EntityAttributes>     

// rect

export type QuestionRectAttributes = EntityAttributes & NotationAttributes & RectAttributes &  QuestionNotationAttributes;

export type QuestionRectCreationAttributes = Omit<QuestionRectAttributes, keyof EntityAttributes>     

// exponent

export type QuestionExponentAttributes = EntityAttributes & NotationAttributes & CellAttributes & QuestionAttributes &  QuestionNotationAttributes;

export type QuestionExponentCreationAttributes = Omit<QuestionExponentAttributes, keyof EntityAttributes>     


