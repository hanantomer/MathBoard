import { BoardType, NotationType } from "./unions";
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


export type ExponentAttributes =  {
  base: string;
  exponent: string;
};


export type NotationCreationAttributes = Omit<NotationAttributes, "uuid">


export type SingleValueAttributes =  {
  value: string;
};


export type CellAttributes =  {
  col: number;
  row: number;
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


export type HorizontalLineAttributes =  {
  fromCol: number;
  toCol: number;
  row: number;
};

export type VerticalLineAttributes =  {
  col: number;
  fromRow: number;
  toRow: number;
};

export type SlopeLineAttributes =  {
  fromCol: number;
  toCol: number;
  fromRow: number;
  toRow: number;
};

export type CurveAttributes =  {
  p1x: number;
  p2x: number;
  p1y: number;
  p2y: number;
  cpx: number;
  cpy: number;
};



export type RectAttributes = {
  fromCol: number;
  toCol: number;
  fromRow: number;
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
export type HorizontalLineNotationAttributes = EntityAttributes & NotationAttributes & HorizontalLineAttributes;
export type VerticalLineNotationAttributes = EntityAttributes & NotationAttributes & VerticalLineAttributes;
export type SlopeLineNotationAttributes = EntityAttributes & NotationAttributes & SlopeLineAttributes;
export type CurveNotationAttributes = EntityAttributes & NotationAttributes & CurveAttributes ;
export type RectNotationAttributes = EntityAttributes & NotationAttributes & RectAttributes & SingleValueAttributes;
export type ExponentNotationAttributes = EntityAttributes &  NotationAttributes & CellAttributes & ExponentAttributes;

// ommiting uuid from creation attributed since created by the databse
export type PointNotationCreationAttributes = Omit<NotationAttributes & CellAttributes & SingleValueAttributes, "uuid">;
export type HorizontalLineNotationCreationAttributes = Omit<NotationAttributes & HorizontalLineAttributes, "uuid">;
export type VerticalLineNotationCreationAttributes = Omit<NotationAttributes & VerticalLineAttributes, "uuid">;
export type SlopeLineNotationCreationAttributes = Omit<NotationAttributes & SlopeLineAttributes, "uuid">;
export type RectNotationCreationAttributes = Omit<NotationAttributes & RectAttributes & SingleValueAttributes, "uuid">;
export type CurveNotationCreationAttributes = Omit<NotationAttributes & CurveAttributes,  "uuid">;
export type ExponentNotationCreationAttributes = Omit<EntityAttributes &  NotationAttributes & CellAttributes & ExponentAttributes, "uuid">;




