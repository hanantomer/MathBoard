import { BoardType, NotationType } from "./enum";


// we dont have a notation model
export abstract class Notation  {
  id: number;
  uuid: string;
  type: NotationType;
  boardType: BoardType;
  selected: boolean;
  userId: number;
  value: string;
  background_color: string;

  constructor(
    id: number,
    uuid: string,
    type: NotationType,
    boardType: BoardType,
    selected: boolean,
    userId: number,
    value: string = "",
    background_color: string =""
) {
    this.id = id
    this.uuid = uuid
    this.type = type
    this.boardType = boardType
    this.selected = selected
    this.userId = userId
    this.value = value;
    this.background_color = background_color;
  }
};

export type Point =  {
  col: number;
  row: number;
};

export type Line =  {
  fromCol: number;
  toCol: number;
  row: number;
};

export type Rect = {
  fromCol: number;
  fromRow: number;
  toCol: number;
  toRow: number;
};


export class PointAttributes extends Notation implements Point {
  //lessonUUId: string;
  col: number;
  row: number;

  constructor(
    id: number,
    uuid: string,
    type: NotationType,
    boardType: BoardType,
    selected: boolean,
    userId: number,
    col: number,
    row: number,
  ) {
    super(id, uuid, type, boardType, selected, userId);
    this.col = col;
    this.row = row;
  }
};

export class LineAttributes extends Notation implements Line {
  
  fromCol: number;
  toCol: number;
  row: number;
  
  constructor(
    id: number,
    uuid: string,
    type: NotationType,
    boardType: BoardType,
    selected: boolean,
    userId: number,
    fromCol: number,
    toCol: number,
    row: number
  ) {
    super(id, uuid, type, boardType, selected, userId);
    this.fromCol = fromCol;
    this.toCol = toCol;
    this.row = row;
  }
};

export class RectAttributes extends Notation implements Rect {
  
  fromCol: number;
  toCol: number;
  fromRow: number;
  toRow: number;
  
  constructor(
    id: number,
    uuid: string,
    type: NotationType,
    boardType: BoardType,
    selected: boolean,
    userId: number,
    fromCol: number,
    toCol: number,
    fromRow: number,
    toRow: number
  ) {
    super(id, uuid, type, boardType, selected, userId);
    this.fromCol = fromCol;
    this.toCol = toCol;
    this.fromRow = fromRow;
    this.toRow = toRow;
  }
};

export class LessonPointNotation extends PointAttributes  {

  constructor(
    id: number,
    uuid: string,
    type: NotationType,
    boardType: BoardType,
    selected: boolean,
    userId: number,
    col: number,
    row: number,
  ) {
    super(id, uuid, type, boardType, selected, userId, col, row);
  }
};


export class LessonLineNotation extends LineAttributes  {
  lessonUUId: string;

  constructor(
    id: number,
    uuid: string,
    type: NotationType,
    boardType: BoardType,
    selected: boolean,
    userId: number,
    lessonUUId: string,
    fromCol: number,
    toCol: number,
    row: number
  ) {
    super(id, uuid, type, boardType, selected, userId, fromCol, toCol, row);
    this.lessonUUId = lessonUUId;
  }
};

export class LessonRectNotation extends RectAttributes  {
  lessonUUId: string;

  constructor(
    id: number,
    uuid: string,
    type: NotationType,
    boardType: BoardType,
    selected: boolean,
    userId: number,
    lessonUUId: string,
    fromCol: number,
    toCol: number,
    fromRow: number,
    toRow: number,
  ) {
    super(id, uuid, type, boardType, selected, userId, fromCol, toCol, fromRow, toRow);
    this.lessonUUId = lessonUUId;
  }
};

export class AnswerPointNotation extends PointAttributes  {
  answerUUId: string;

  constructor(
    id: number,
    uuid: string,
    type: NotationType,
    boardType: BoardType,
    selected: boolean,
    userId: number,
    answerUUId: string,
    col: number,
    row: number,
  ) {
    super(id, uuid, type, boardType, selected, userId, col, row);
    this.answerUUId = answerUUId;
  }
};

export class AnswerLineNotation extends LineAttributes  {
  answerUUId: string;

  constructor(
    id: number,
    uuid: string,
    type: NotationType,
    boardType: BoardType,
    selected: boolean,
    userId: number,
    answerUUId: string,
    fromCol: number,
    toCol: number,
    row: number
  ) {
    super(id, uuid, type, boardType, selected, userId, fromCol, toCol, row);
    this.answerUUId = answerUUId;
  }
};

export class AnswerRectNotation extends RectAttributes {
  answerUUId: string;
  
  constructor(
    id: number,
    uuid: string,
    type: NotationType,
    boardType: BoardType,
    selected: boolean,
    userId: number,
    answerUUId: string,
    fromCol: number,
    toCol: number,
    fromRow: number,
    toRow: number,
  ) {
    super(id, uuid, type, boardType, selected, userId, fromCol, toCol, fromRow, toRow);
    this.answerUUId = answerUUId;
  }
};

export class QuestionPointNotation extends PointAttributes  {
  questionUUId: string;

  constructor(
    id: number,
    uuid: string,
    type: NotationType,
    boardType: BoardType,
    selected: boolean,
    userId: number,
    questionUUId: string,
    col: number,
    row: number,
  ) {
    super(id, uuid, type, boardType, selected, userId, col, row);
    this.questionUUId = questionUUId;
  }
};

export class QuestionLineNotation extends LineAttributes {
  questionUUId: string;

  constructor(
    id: number,
    uuid: string,
    type: NotationType,
    boardType: BoardType,
    selected: boolean,
    userId: number,
    questionUUId: string,
    fromCol: number,
    toCol: number,
    row: number
  ) {
    super(id, uuid, type, boardType, selected, userId, fromCol, toCol, row);
    this.questionUUId = questionUUId;
  }
};

export class QuestionRectNotation extends RectAttributes {
  questionUUId: string;

  constructor(
    id: number,
    uuid: string,
    type: NotationType,
    boardType: BoardType,
    selected: boolean,
    userId: number,
    questionUUId: string,
    fromCol: number,
    toCol: number,
    fromRow: number,
    toRow: number,
  ) {
    super(id, uuid, type, boardType, selected, userId, fromCol, toCol, fromRow, toRow);
    this.questionUUId = questionUUId;
  }
};




