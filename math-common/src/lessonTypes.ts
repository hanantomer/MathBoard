import { 
  HorizontalLineAttributes, 
  VerticalLineAttributes, 
  SlopeLineAttributes, 
  CellAttributes, 
  RectAttributes, 
  SingleValueAttributes,
  BoardAttributes,
  EntityAttributes,
  NotationAttributes
} from "./baseTypes";

// lesson

export type LessonAttributes = EntityAttributes & BoardAttributes 

export type LessonCreationAttributes = Omit<LessonAttributes, keyof EntityAttributes>

// line

export type  LessonHorizontalLineAttributes = EntityAttributes & NotationAttributes & HorizontalLineAttributes;

export type LessonHorizontalLineCreationAttributes = Omit<LessonHorizontalLineAttributes, keyof EntityAttributes> 

export type  LessonVerticalLineAttributes = EntityAttributes & NotationAttributes & VerticalLineAttributes;

export type LessonVerticalLineCreationAttributes = Omit<LessonVerticalLineAttributes, keyof EntityAttributes> 

export type  LessonSlopeLineAttributes = EntityAttributes & NotationAttributes & SlopeLineAttributes;

export type LessonSlopeLineCreationAttributes = Omit<LessonSlopeLineAttributes, keyof EntityAttributes> 

  
// point

export type LessonPointAttributes = EntityAttributes & NotationAttributes & CellAttributes &  SingleValueAttributes;

export type LessonPointCreationAttributes = Omit<LessonPointAttributes, keyof EntityAttributes>     

// rect

export type LessonRectAttributes = EntityAttributes & NotationAttributes & RectAttributes ;

export type LessonRectCreationAttributes = Omit<LessonRectAttributes, keyof EntityAttributes>     


// exponent

export type LessonExponentAttributes = EntityAttributes & NotationAttributes & CellAttributes & LessonAttributes &  LessonNotationAttributes;

export type LessonExponentCreationAttributes = Omit<LessonExponentAttributes, keyof EntityAttributes>     


export type LessonNotationAttributes = NotationAttributes &  {
  lesson:  LessonAttributes
}

