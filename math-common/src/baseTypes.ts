import { BoardType, CellPart, NotationType } from "./unions";
import { UserAttributes } from "./userTypes";

export type EntityAttributes = {  
  id?: number; 
  uuid: string;
  createdAt?: Date;
  updatedAt?: Date;
}


export type NotationAttributes = {
  uuid: string;
  parentUUId: string;
  user: UserAttributes;
  notationType: NotationType;
  boardType: BoardType;
  selected?: boolean;
} 

export type NotationCreationAttributes = Omit<NotationAttributes, "uuid">


export type SingleValueAttributes =  {
  value: string;
};

export type ExponentAttributes =  {
  base: string;
  exponent: string;
};

export type TriangleAttributes =  {
  A: number;
  B: number;
  C: number;
};

export type CellAttributes =  {
  col: number;
  row: number;
  part: CellPart;
};

export type SelectedCell = CellAttributes & {
  userUUId: string;
  lessonUUId: number;
}

export type ColorizedCell  = CellAttributes & {
  userUUId: string;
  lessonUUId: number;
  color: string;
}


export type LineAttributes =  {
  fromCol: number;
  toCol: number;
  row: number;
};

export type RectAttributes = {
  fromCol: number;
  fromRow: number;
  toCol: number;
  toRow: number;
};

export type BoardAttributes = {
  name: string;
  user: UserAttributes;
};

export type Board = {
  uuid: string;
  type: BoardType;
};


export type PointNotationAttributes = EntityAttributes &  NotationAttributes & CellAttributes & SingleValueAttributes;
export type LineNotationAttributes = EntityAttributes & NotationAttributes & LineAttributes & SingleValueAttributes;
export type RectNotationAttributes = EntityAttributes & NotationAttributes & RectAttributes & SingleValueAttributes;
export type ExponentNotationAttributes = EntityAttributes &  NotationAttributes & CellAttributes & ExponentAttributes;
export type TriangleNotationAttributes = EntityAttributes &  NotationAttributes & CellAttributes & TriangleAttributes;

// ommiting uuid from creation attributed since created by the databse
export type PointNotationCreationAttributes = Omit<NotationAttributes & CellAttributes & SingleValueAttributes, "uuid">;
export type LineNotationCreationAttributes = Omit<NotationAttributes & LineAttributes, "uuid">;
export type RectNotationCreationAttributes = Omit<NotationAttributes & RectAttributes & SingleValueAttributes, "uuid">;
export type ExponentNotationCreationAttributes = Omit<EntityAttributes &  NotationAttributes & CellAttributes & ExponentAttributes, "uuid">;
export type TriangleNotationCreationAttributes = Omit<SingleValueAttributes & EntityAttributes &  NotationAttributes & RectAttributes & TriangleAttributes, "uuid">;



