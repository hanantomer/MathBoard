import { BoardType, NotationType, UesrType } from "./enum";

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>; // copied from sequlize




export interface BaseNotation {
  id: number;
  uuid: string;
  user: UserAttributes;
  notationType: NotationType;
  boardType: BoardType;
  createdAt: Date;
}


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



export interface RectAttributes {
  fromCol: number;
  toCol: number;
  fromRow: number;
  toRow: number;
  value: string;
}

export interface LineAttributes {
  fromCol: number;
  toCol: number;
  row: number;
}    

export interface PointAttributes  {
  col: number;
  row: number;
  value: string;
}

// user
export interface UserAttributes {
  id?: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  access_token: string;
  imageUrl: string;
  userType: UesrType;
  authorized: boolean;
  lastHeartbeatTime: Date;
}

export interface UserCreateAttributes extends Optional<UserAttributes, "id"> {
}
export interface AnswerAttributes extends BaseNotation{
  name: string;
  questionId: number;
  question: QuestionAttributes;
}

export interface AnswerCreateAttributes extends Optional<AnswerAttributes, "id"> {}

export interface AnswerNotationAttributes {
  answer: AnswerAttributes;
}

export interface AnswerLineAttributes
    extends BaseNotation, 
        LineAttributes,
        AnswerNotationAttributes {}

export interface AnswerLineCreationAttributes
    extends Optional<AnswerLineAttributes, "id"> {}

  export interface AnswerPointAttributes extends BaseNotation, PointAttributes, AnswerNotationAttributes {
  }
  export interface AnswerPointCreationAttributes extends Optional<AnswerPointAttributes, "id"> {
  }
  
  export interface AnswerRectAttributes
  extends BaseNotation,
      RectAttributes,
      AnswerNotationAttributes {}

export interface AnswerRectCreationAttributes
  extends Optional<AnswerRectAttributes, "id"> {}

// question

export interface QuestionNotationAttributes {
  question: QuestionAttributes;
}


export interface QuestionAttributes extends BaseNotation {
  lessonId: number;
  lesson: LessonAttributes;
  name: string;
}

export interface QuestionCreateAttributes
  extends Optional<QuestionAttributes, "id"> {}

  export interface QuestionLineAttributes
  extends BaseNotation,
      LineAttributes,
      QuestionNotationAttributes {}

export interface QuestionLineCreationAttributes
  extends Optional<QuestionLineAttributes, "id"> {}

  export interface QuestionPointAttributes
  extends BaseNotation,
      PointAttributes,
      QuestionNotationAttributes {}

export interface QuestionPointCreationAttributes
  extends Optional<QuestionPointAttributes, "id"> {}

export interface QuestionRectAttributes
  extends BaseNotation,
      RectAttributes,
      QuestionNotationAttributes {}

export interface QuestionRectCreationAttributes
  extends Optional<QuestionRectAttributes, "id"> {}



// lesson

export interface LessonNotationAttributes {
  lesson: LessonAttributes;
}

export interface LessonAttributes extends BaseNotation{
  name: string;
}
export interface LessonCreateAttributes extends Optional<LessonAttributes, "id"> {
}

export interface LessonLineAttributes extends BaseNotation,
    LineAttributes,
    LessonNotationAttributes {}

export interface LessonLineCreationAttributes
  extends Optional<LessonLineAttributes, "id"> {}


export interface LessonPointAttributes
  extends BaseNotation,
      PointAttributes,
      LessonNotationAttributes {}

export interface LessonPointCreationAttributes
  extends Optional<LessonPointAttributes, "id"> {}


export interface LessonRectAttributes
  extends BaseNotation,
      RectAttributes,
      LessonNotationAttributes {}

export interface LessonRectCreateAttributes
  extends Optional<LessonRectAttributes, "id"> {}

// student lesson
export interface StudentLessonAttributes {
    id?: number;
    user: UserAttributes;
    userId: number;
    lessonId: number;
    lesson: LessonAttributes;
}

export interface StudentLessonCreateAttributes
    extends Optional<StudentLessonAttributes, "id"> {}




export type PointNotationAttributes = BaseNotation & PointAttributes;
export type LineNotationAttributes = BaseNotation & LineAttributes;
export type RectNotationAttributes = BaseNotation & RectAttributes;






