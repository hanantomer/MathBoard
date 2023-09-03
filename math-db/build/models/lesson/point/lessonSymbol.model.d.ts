import { Model } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/build/enum";
import { LessonPointAttributes, LessonPointCreationAttributes } from "../../../../../math-common/build/notationTypes";
import User from "../../user.model";
import Lesson from "../../lesson/lesson.model";
export default class LessonSymbol extends Model<LessonPointAttributes, LessonPointCreationAttributes> {
    notationType: NotationType;
    boardType: BoardType;
    uuid: string;
    userId: number;
    user: User;
    lessonId: number;
    lesson: Lesson;
    col: number;
    row: number;
    value: string;
}
