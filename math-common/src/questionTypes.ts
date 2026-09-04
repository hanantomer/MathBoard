import { LessonAttributes } from "./lessonTypes";
import { PracticeQuestionMeta } from "./practiceQuestionTypes";
import {
  LineAttributes,
  CurveAttributes,
  CellAttributes,
  AnnotationAttributes,
  RectAttributes,
  ImageAttributes,
  SingleValueAttributes,
  BoardAttributes,
  EntityAttributes,
  NotationAttributes,
  CircleAttributes,
  ConicAttributes,
  FreeSketchAttributes,
} from "./baseTypes";

// question

export type QuestionAttributes =
  EntityAttributes &
    BoardAttributes & {
      lesson?: LessonAttributes | null;
      /** Present when this question stem is in the practice bank. */
      practice?: PracticeQuestionMeta | null;
    };

export type QuestionCreationAttributes = Omit<
  QuestionAttributes,
  keyof EntityAttributes | "practice"
> & {
  lesson: LessonAttributes;
};

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

// annotation

export type QuestionAnnotationAttributes =
  AnnotationAttributes &
    EntityAttributes &
    NotationAttributes &
    CellAttributes &
    SingleValueAttributes &
    QuestionNotationAttributes;

export type QuestionAnnotationCreationAttributes =
  Omit<
    QuestionAnnotationAttributes,
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

export type QuestionImageAttributes = QuestionRectAttributes & ImageAttributes;

export type QuestionImageCreationAttributes = Omit<
  QuestionImageAttributes,
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

export type QuestionConicAttributes =
  EntityAttributes &
    NotationAttributes &
    ConicAttributes &
    QuestionNotationAttributes;

export type QuestionConicCreationAttributes =
  Omit<
    QuestionConicAttributes,
    keyof EntityAttributes
  >;

// free sketch

export type QuestionFreeSketchAttributes =
  EntityAttributes &
    NotationAttributes &
    FreeSketchAttributes &
    QuestionNotationAttributes;

export type QuestionFreeSketchCreationAttributes =
  Omit<
    QuestionFreeSketchAttributes,
    keyof EntityAttributes
  >;
