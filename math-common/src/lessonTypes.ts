import { 
  LineAttributes, 
  PointAttributes, 
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

export type  LessonLineAttributes = EntityAttributes & NotationAttributes & LineAttributes ;

export type LessonLineCreationAttributes = Omit<LessonLineAttributes, keyof EntityAttributes> 
  
// point

export type LessonPointAttributes = EntityAttributes & NotationAttributes & PointAttributes &  SingleValueAttributes;

export type LessonPointCreationAttributes = Omit<LessonPointAttributes, keyof EntityAttributes>     

// rect

export type LessonRectAttributes = EntityAttributes & NotationAttributes & RectAttributes ;

export type LessonRectCreationAttributes = Omit<LessonRectAttributes, keyof EntityAttributes>     


// exponent

export type LessonExponentAttributes = EntityAttributes & NotationAttributes & PointAttributes & LessonAttributes &  LessonNotationAttributes;

export type LessonExponentCreationAttributes = Omit<LessonExponentAttributes, keyof EntityAttributes>     


export type LessonNotationAttributes = NotationAttributes &  {
  lesson:  LessonAttributes
}

