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
  PointNotationAttributes,
} from "./baseTypes";

// lesson

export type LessonAttributes = EntityAttributes &
  BoardAttributes;

export type LessonCreationAttributes = Omit<
  LessonAttributes,
  keyof EntityAttributes
>;

// line


export type LessonLineAttributes =
  EntityAttributes &
    NotationAttributes &
    LineAttributes;

export type LessonLineCreationAttributes = Omit<
  LessonLineAttributes,
  keyof EntityAttributes
>;

export type LessonCurveAttributes =
  EntityAttributes &
    NotationAttributes &
    CurveAttributes &
    LessonNotationAttributes;

export type LessonCurveCreationAttributes = Omit<
  LessonCurveAttributes,
  keyof EntityAttributes
>;

// point

export type LessonPointAttributes =
  EntityAttributes &
    NotationAttributes &
    CellAttributes &
    SingleValueAttributes;

export type LessonPointCreationAttributes = Omit<
  LessonPointAttributes,
  keyof EntityAttributes
>;

// rect

export type LessonRectAttributes =
  EntityAttributes &
    NotationAttributes &
    RectAttributes;

export type LessonRectCreationAttributes = Omit<
  LessonRectAttributes,
  keyof EntityAttributes
>;

// exponent

export type LessonExponentAttributes =
  LessonAttributes &
    LessonNotationAttributes &
    PointNotationAttributes;

export type LessonExponentCreationAttributes =
  Omit<
    LessonExponentAttributes,
    keyof EntityAttributes
  >;

export type LessonNotationAttributes =
  NotationAttributes & {
    lesson: LessonAttributes;
  };

// circle

export type LessonCircleAttributes =
  EntityAttributes &
    NotationAttributes &
    CircleAttributes &
    LessonNotationAttributes;

export type LessonCircleCreationAttributes = Omit<
  LessonCircleAttributes,
  keyof EntityAttributes
>;
