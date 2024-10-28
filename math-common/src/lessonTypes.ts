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
  NotationAttributes,
  ExponentNotationAttributes,
} from "./baseTypes";

// lesson

export type LessonAttributes = EntityAttributes &
  BoardAttributes;

export type LessonCreationAttributes = Omit<
  LessonAttributes,
  keyof EntityAttributes
>;

// line

export type LessonHorizontalLineAttributes =
  EntityAttributes &
    NotationAttributes &
    HorizontalLineAttributes;

export type LessonHorizontalLineCreationAttributes =
  Omit<
    LessonHorizontalLineAttributes,
    keyof EntityAttributes
  >;

export type LessonVerticalLineAttributes =
  EntityAttributes &
    NotationAttributes &
    VerticalLineAttributes;

export type LessonVerticalLineCreationAttributes =
  Omit<
    LessonVerticalLineAttributes,
    keyof EntityAttributes
  >;

export type LessonSlopeLineAttributes =
  EntityAttributes &
    NotationAttributes &
    SlopeLineAttributes;

export type LessonSlopeLineCreationAttributes =
  Omit<
    LessonSlopeLineAttributes,
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
    ExponentNotationAttributes;

export type LessonExponentCreationAttributes =
  Omit<
    LessonExponentAttributes,
    keyof EntityAttributes
  >;

export type LessonNotationAttributes =
  NotationAttributes & {
    lesson: LessonAttributes;
  };
