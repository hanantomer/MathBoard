import { LessonAttributes } from "./lessonTypes";
import {
  LineAttributes,
  CurveAttributes,
  CellAttributes,
  RectAttributes,
  SingleValueAttributes,
  BoardAttributes,
  EntityAttributes,
  NotationAttributes,
  CircleAttributes,
} from "./baseTypes";

// question

export type QuestionAttributes =
  EntityAttributes &
    BoardAttributes & {
      lesson: LessonAttributes;
    };

export type QuestionCreationAttributes = Omit<
  QuestionAttributes,
  keyof EntityAttributes
>;

// every question notations has a lesson as parent

type QuestionNotationAttributes = {
  question: QuestionAttributes;
};

// line

export type QuestionLineAttributes =
  EntityAttributes &
    NotationAttributes &
    LineAttributes &
    QuestionNotationAttributes;

export type QuestionLineCreationAttributes = Omit<
  QuestionLineAttributes,
  keyof EntityAttributes
>;

export type QuestionCurveAttributes =
  EntityAttributes &
    NotationAttributes &
    CurveAttributes &
    QuestionNotationAttributes;

export type QuestionCurveCreationAttributes =
  Omit<
    QuestionCurveAttributes,
    keyof EntityAttributes
  >;

// point

export type QuestionPointAttributes =
  EntityAttributes &
    NotationAttributes &
    CellAttributes &
    QuestionNotationAttributes &
    SingleValueAttributes;

export type QuestionPointCreationAttributes =
  Omit<
    QuestionPointAttributes,
    keyof EntityAttributes
  >;

// rect

export type QuestionRectAttributes =
  EntityAttributes &
    NotationAttributes &
    RectAttributes &
    QuestionNotationAttributes;

export type QuestionRectCreationAttributes = Omit<
  QuestionRectAttributes,
  keyof EntityAttributes
>;

// exponent

export type QuestionExponentAttributes =
  EntityAttributes &
    NotationAttributes &
    CellAttributes &
    QuestionAttributes &
    QuestionNotationAttributes;

export type QuestionExponentCreationAttributes =
  Omit<
    QuestionExponentAttributes,
    keyof EntityAttributes
  >;

// circle

export type QuestionCircleAttributes =
  EntityAttributes &
    NotationAttributes &
    CircleAttributes &
    QuestionNotationAttributes;

export type QuestionCircleCreationAttributes =
  Omit<
    QuestionCircleAttributes,
    keyof EntityAttributes
  >;
