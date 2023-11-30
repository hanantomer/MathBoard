import { LessonAttributes } from "./lessonTypes";
import { 
  LineAttributes, 
  PointAttributes, 
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

export type QuestionCreationAttributes = 
  {lessonUUId: string} &
  Omit<QuestionAttributes, keyof EntityAttributes>

// every question notations has a lesson as parent

type QuestionNotationAttributes = {
  question: QuestionAttributes;
}

// line

export type  QuestionLineAttributes = EntityAttributes & NotationAttributes & LineAttributes &  QuestionNotationAttributes;

export type QuestionLineCreationAttributes = Omit<QuestionLineAttributes, keyof EntityAttributes> 
  
// point

export type QuestionPointAttributes = EntityAttributes & NotationAttributes & PointAttributes &  QuestionNotationAttributes & SingleValueAttributes;

export type QuestionPointCreationAttributes = Omit<QuestionPointAttributes, keyof EntityAttributes>     

// rect

export type QuestionRectAttributes = EntityAttributes & NotationAttributes & RectAttributes &  QuestionNotationAttributes;

export type QuestionRectCreationAttributes = Omit<QuestionRectAttributes, keyof EntityAttributes>     

// exponent

export type QuestionExponentAttributes = EntityAttributes & NotationAttributes & PointAttributes & QuestionAttributes &  QuestionNotationAttributes;

export type QuestionExponentCreationAttributes = Omit<QuestionExponentAttributes, keyof EntityAttributes>     


