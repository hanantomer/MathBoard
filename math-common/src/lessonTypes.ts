import { UserAttributes } from "./userTypes";
import { BaseEntity, BaseNotation, LineAttributes, PointAttributes, RectAttributes } from "./baseTypes";

// lesson

export interface LessonAttributes extends BaseEntity{
  name: string;
  user: UserAttributes;
}

export type LessonCreateAttributes = Omit<LessonAttributes, keyof BaseEntity> 

// lesson notations

interface LessonNotationAttributes {
  lesson: LessonAttributes;
}

// line

export interface LessonLineAttributes extends 
    BaseNotation,
    LineAttributes,
    LessonNotationAttributes {}

export type LessonLineCreationAttributes = Omit<LessonLineAttributes, keyof BaseEntity> 
  
// point

export interface LessonPointAttributes extends 
    BaseNotation,
    PointAttributes,
    LessonNotationAttributes {}

export type LessonPointCreationAttributes = Omit<LessonPointAttributes, keyof BaseEntity>     

// rect

export interface LessonRectAttributes extends 
    BaseNotation,
    RectAttributes,
    LessonNotationAttributes {}

export type LessonRectCreationAttributes = Omit<LessonRectAttributes, keyof BaseEntity>         

