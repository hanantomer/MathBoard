import { BoardType, NotationType } from "../../../math-common/src/enum";


// we dont have a notation model
export abstract class Notation  {
  id: number;
  uuid: string;
  type: NotationType;
  boardType: BoardType;
  selected: boolean;
  userId: number;

  constructor(
    id: number,
    uuid: string,
    type: NotationType,
    boardType: BoardType,
    selected: boolean,
    userId: number,
) {
    this.id = id
    this.uuid = uuid
    this.type = type
    this.boardType = boardType
    this.selected = selected
    this.userId = userId
  }
};

export type Point =  {
  col: number;
  row: number;
  value: string;
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

// lesson

export class PointNotation extends Notation implements Point {
  //lessonUUId: string;
  col: number;
  row: number;
  value: string;

  constructor(
    id: number,
    uuid: string,
    type: NotationType,
    boardType: BoardType,
    selected: boolean,
    userId: number,
    //lessonUUId: string,
    col: number,
    row: number,
    value: string
  ) {
    super(id, uuid, type, boardType, selected, userId);
    //this.lessonUUId = lessonUUId;
    this.col = col;
    this.row = row;
    this.value = value;
  }
};

export class LessonLineNotation extends Notation implements Line {
  lessonUUId: string;
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
    lessonUUId: string,
    fromCol: number,
    toCol: number,
    row: number
  ) {
    super(id, uuid, type, boardType, selected, userId);
    this.lessonUUId = lessonUUId;
    this.fromCol = fromCol;
    this.toCol = toCol;
    this.row = row;
  }
};

export class LessonRectNotation extends Notation implements Rect {
  lessonUUId: string;
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
    lessonUUId: string,
    fromCol: number,
    toCol: number,
    fromRow: number,
    toRow: number
  ) {
    super(id, uuid, type, boardType, selected, userId);
    this.lessonUUId = lessonUUId;
    this.fromCol = fromCol
    this.toCol = toCol;
    this.fromRow = fromRow;
    this.toRow = toRow;
  }
};

// question

export class AnswerPointNotation extends Notation implements Point {
  answerUUId: string;
  col: number;
  row: number;
  value: string;

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
    value: string
  ) {
    super(id, uuid, type, boardType, selected, userId);
    this.answerUUId = answerUUId;
    this.col = col;
    this.row = row;
    this.value = value;
  }
};

export class AnswerLineNotation extends Notation implements Line {
  answerUUId: string;
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
    answerUUId: string,
    fromCol: number,
    toCol: number,
    row: number
  ) {
    super(id, uuid, type, boardType, selected, userId);
    this.answerUUId = answerUUId;
    this.fromCol = fromCol;
    this.toCol = toCol;
    this.row = row;
  }
};

export class AnswerRectNotation extends Notation implements Rect {
  answerUUId: string;
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
    answerUUId: string,
    fromCol: number,
    toCol: number,
    fromRow: number,
    toRow: number
  ) {
    super(id, uuid, type, boardType, selected, userId);
    this.answerUUId = answerUUId;
    this.fromCol = fromCol
    this.toCol = toCol;
    this.fromRow = fromRow;
    this.toRow = toRow;
  }
};


// answer

export class QuestionPointNotation extends Notation implements Point {
  questionUUId: string;
  col: number;
  row: number;
  value: string;

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
    value: string
  ) {
    super(id, uuid, type, boardType, selected, userId);
    this.questionUUId = questionUUId;
    this.col = col;
    this.row = row;
    this.value = value;
  }
};

export class QuestionLineNotation extends Notation implements Line {
  questionUUId: string;
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
    questionUUId: string,
    fromCol: number,
    toCol: number,
    row: number
  ) {
    super(id, uuid, type, boardType, selected, userId);
    this.questionUUId = questionUUId;
    this.fromCol = fromCol;
    this.toCol = toCol;
    this.row = row;
  }
};

export class QuestionRectNotation extends Notation implements Rect {
  questionUUId: string;
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
    questionUUId: string,
    fromCol: number,
    toCol: number,
    fromRow: number,
    toRow: number
  ) {
    super(id, uuid, type, boardType, selected, userId);
    this.questionUUId = questionUUId;
    this.fromCol = fromCol
    this.toCol = toCol;
    this.fromRow = fromRow;
    this.toRow = toRow;
  }
};




