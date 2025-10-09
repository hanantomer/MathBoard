import { QuestionAttributes } from "./questionTypes";
import {
  LineAttributes,
  CurveAttributes,
  CellAttributes,
  AnnotationAttributes,
  RectAttributes,
  CircleAttributes,
  SingleValueAttributes,
  BoardAttributes,
  EntityAttributes,
  NotationAttributes,
} from "./baseTypes";

// answer

export type AnswerAttributes = EntityAttributes &
  BoardAttributes & {
    question: QuestionAttributes;
  };

export type AnswerCreationAttributes = Omit<
  AnswerAttributes,
  keyof EntityAttributes
>;

// every answer notations has an answer as parent

type AnswerNotationAttributes = {
  answer: AnswerAttributes;
};

// line


export type AnswerLineAttributes =
  EntityAttributes &
    NotationAttributes &
    LineAttributes &
    AnswerNotationAttributes;

export type AnswerLineCreationAttributes = Omit<
  AnswerLineAttributes,
  keyof EntityAttributes
>;

export type AnswerCurveAttributes =
  EntityAttributes &
    NotationAttributes &
    CurveAttributes &
    AnswerNotationAttributes;

export type AnswerCurveCreationAttributes = Omit<
  AnswerCurveAttributes,
  keyof EntityAttributes
>;

// point

export type AnswerPointAttributes =
  EntityAttributes &
    NotationAttributes &
    CellAttributes &
    AnswerNotationAttributes &
    SingleValueAttributes;

export type AnswerPointCreationAttributes = Omit<
  AnswerPointAttributes,
  keyof EntityAttributes
  >;

// annotation
export type AnswerAnnotationAttributes =
  AnnotationAttributes & 
    EntityAttributes &
    NotationAttributes &
    CellAttributes &
    SingleValueAttributes &
  AnswerNotationAttributes;
    
export type AnswerAnnotationCreationAttributes = Omit<
  AnswerAnnotationAttributes,
  keyof EntityAttributes
>;

// rect

export type AnswerRectAttributes =
  EntityAttributes &
    NotationAttributes &
    RectAttributes &
    AnswerNotationAttributes;

export type AnswerRectCreationAttributes = Omit<
  AnswerRectAttributes,
  keyof EntityAttributes
>;

// circle

export type AnswerCircleAttributes =
  EntityAttributes &
    NotationAttributes &
    CircleAttributes &
    AnswerNotationAttributes;

export type AnswerCircleCreationAttributes = Omit<
  AnswerCircleAttributes,
  keyof EntityAttributes
>;
