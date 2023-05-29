export enum BoardType{
  LESSON,
  QUESTION,
  ANSWER
};

export enum NotationType { // TODO move to class with static readonly fields and set type family to each type
  SYMBOL,
  SIGN,
  POWER,
  FRACTION,
  SQRT,
  TEXT,
  IMAGE,
  GEO
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


