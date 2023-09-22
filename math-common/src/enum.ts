export enum BoardType {
  LESSON,
  QUESTION,
  ANSWER
};


export enum NotationShape {
  POINT,
  LINE,
  RECT
}


export enum NotationType { // TODO move to class with static readonly fields and set type family to each type
  SYMBOL,
  SIGN,
  POWER,
  FRACTION,
  SQRT,
  SQRTSYMBOL,
  TEXT,
  IMAGE,
  GEO
};

export const NotationTypeShape = new Map<number, number> ([
  [NotationType.SYMBOL, NotationShape.POINT],
  [NotationType.SIGN, NotationShape.POINT],
  [NotationType.POWER, NotationShape.POINT],
  [NotationType.SQRT, NotationShape.LINE],
  [NotationType.FRACTION, NotationShape.LINE],
  [NotationType.TEXT, NotationShape.RECT],
  [NotationType.IMAGE, NotationShape.RECT],
  [NotationType.GEO, NotationShape.RECT]
])

export enum AreaSelectionMode {
  SELECTING,
  MOVE
};



export enum EditMode {
  SYMBOL,
  POWER,
  TEXT,
  FRACTION,
  SQRT,
  DELETING, // mouse clicked following delete button pressed
  SELECT, //  after select button pressed
  CHECKMARK, // after checkmark button pressed
  SEMICHECKMARK, // after semicheck button pressed
  XMARK, // after xmark button pressed
};

export enum UesrType {
  TEACHER, 
  STUDENT 
};


export enum LoginType {
  LOGIN,
  REGISTER
};



