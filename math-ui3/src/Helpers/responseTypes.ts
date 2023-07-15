/**
 * All this mess cause we cant use inheritance with sequlize-typescript entities
 */

import { Model } from "sequelize-typescript";

//import Lesson from "../../../math-db/src/models/lesson/lesson.model";
//import Question from "../../../math-db/src/models/question/question.model";
//import Answer from "../../../math-db/src/models/answer/answer.model";

import LessonSymbol from "../../../math-db/src/models/lesson/point/lessonSymbol.model";
import LessonSign from "../../../math-db/src/models/lesson/point/lessonSign.model";
import LessonPower from "../../../math-db/src/models/lesson/point/lessonPower.model";
import LessonFraction from "../../../math-db/src/models/lesson/line/lessonFraction.model";
import LessonRoot from "../../../math-db/src/models/lesson/line/lessonRoot.model";
import LessonSqrt from "../../../math-db/src/models/lesson/line/lessonSqrt.model";
import LessonText from "../../../math-db/src/models/lesson/rect/lessonText.model";
import LessonImage from "../../../math-db/src/models/lesson/rect/lessonImage.model";

import QuestionSymbol from "../../../math-db/src/models/question/point/questionSymbol.model";
import QuestionSign from "../../../math-db/src/models/question/point/questionSign.model";
import QuestionPower from "../../../math-db/src/models/question/point/questionPower.model";
import QuestionFraction from "../../../math-db/src/models/question/line/questionFraction.model";
import QuestionRoot from "../../../math-db/src/models/question/line/questionRoot.model";
import QuestionSqrt from "../../../math-db/src/models/question/line/questionSqrt.model";
import QuestionText from "../../../math-db/src/models/question/rect/questionText.model";
import QuestionImage from "../../../math-db/src/models/question/rect/questionImage.model";

import AnswerSymbol from "../../../math-db/src/models/answer/point/answerSymbol.model";
import AnswerSign from "../../../math-db/src/models/answer/point/answerSign.model";
import AnswerPower from "../../../math-db/src/models/answer/point/answerPower.model";
import AnswerFraction from "../../../math-db/src/models/answer/line/answerFraction.model";
import AnswerRoot from "../../../math-db/src/models/answer/line/answerRoot.model";
import AnswerSqrt from "../../../math-db/src/models/answer/line/answerSqrt.model";
import AnswerText from "../../../math-db/src/models/answer/rect/answerText.model";
import AnswerImage from "../../../math-db/src/models/answer/rect/answerImage.model";

export interface Response<T extends Model> {
  data: T[];
}

export type PointNotation =
  | LessonSymbol
  | LessonSign
  | LessonPower
  | QuestionSymbol
  | QuestionSign
  | QuestionPower
  | AnswerSymbol
  | AnswerSign
  | AnswerPower;

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

export type RectNotation =
  | LessonImage
  | LessonText
  | QuestionImage
  | QuestionText
  | AnswerImage
  | AnswerText;

export type Notation = PointNotation | LineNotation | RectNotation;
export type TextNotation = AnswerText | LessonText | QuestionText;
export type ImageNotation = AnswerImage | LessonImage | QuestionImage;
export type SymbolNotation = AnswerSymbol | LessonSymbol | QuestionSymbol;
export type SqrtNotation = AnswerSqrt | LessonSqrt | QuestionSqrt;
export type FractionNotation = AnswerFraction | LessonFraction | QuestionFraction;
export type RootNotation = AnswerRoot | LessonRoot | QuestionRoot;
export type PowerNotation = AnswerPower | LessonPower | QuestionPower;
export type SignNotation = AnswerSign | LessonSign | QuestionSign;

