import LessonSymbol from "../../../math-db/src/models/lesson/point/lessonSymbol.model";
import LessonFraction from "../../../math-db/src/models/lesson/line/lessonFraction.model";
import LessonRoot from "../../../math-db/src/models/lesson/line/lessonRoot.model";
import LessonSqrt from "../../../math-db/src/models/lesson/line/lessonSqrt.model";
import LessonText from "../../../math-db/src/models/lesson/rect/lessonText.model";
import LessonImage from "../../../math-db/src/models/lesson/rect/lessonImage.model";

import QuestionSymbol from "../../../math-db/src/models/question/point/questionSymbol.model";
import QuestionFraction from "../../../math-db/src/models/question/line/questionFraction.model";
import QuestionRoot from "../../../math-db/src/models/question/line/questionRoot.model";
import QuestionSqrt from "../../../math-db/src/models/question/line/questionSqrt.model";
import QuestionText from "../../../math-db/src/models/question/rect/questionText.model";
import QuestionImage from "../../../math-db/src/models/question/rect/questionImage.model";

import AnswerSymbol from "../../../math-db/src/models/answer/point/answerSymbol.model";
import AnswerFraction from "../../../math-db/src/models/answer/line/answerFraction.model";
import AnswerRoot from "../../../math-db/src/models/answer/line/answerRoot.model";
import AnswerSqrt from "../../../math-db/src/models/answer/line/answerSqrt.model";
import AnswerText from "../../../math-db/src/models/answer/rect/answerText.model";
import AnswerImage from "../../../math-db/src/models/answer/rect/answerImage.model";

import User from "../../../math-db/src/models/user.model";
import Lesson from "../../../math-db/src/models/lesson/lesson.model";
import Question from "../../../math-db/src/models/question/question.model";
import Answer from "../../../math-db/src/models/answer/answer.model";


export interface UserResponse {
  data: User[];
}
export interface LessonResponse {
  data: Lesson[];
}
export interface QuestionResponse {
  data: Question[];
}
export interface AnswerResponse {
  data: Answer[];
}

export type PointNotation = LessonSymbol | QuestionSymbol | AnswerSymbol;

export interface PointNotationResponse {
  data: PointNotation[];
}

export type LineNotation =
  | LessonFraction
  | LessonRoot
  | LessonSqrt
  | QuestionFraction
  | QuestionRoot
  | QuestionSqrt
  | AnswerFraction
  | AnswerRoot
  | AnswerSqrt;

export interface LineNotationResponse {
  data: LineNotation[];
}

export type RectNotation =
  | LessonImage
  | LessonText
  | QuestionImage
  | QuestionText
  | AnswerImage
  | AnswerText;

export interface RectNotationResponse {
  data: RectNotation[];
}

export type Notation = PointNotation | LineNotation | RectNotation;

export type NotationResponse =
  | PointNotationResponse
  | LineNotationResponse
  | RectNotationResponse;
