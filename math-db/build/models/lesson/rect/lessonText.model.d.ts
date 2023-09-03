import { Model } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/build/enum";
import User from "../../user.model";
import Lesson from "../../lesson/lesson.model";
import { LessonRectAttributes, LessonRectCreateAttributes } from "../../../../../math-common/build/notationTypes";
export default class LessonText extends Model<LessonRectAttributes, LessonRectCreateAttributes> {
    notationType: NotationType;
    boardType: BoardType;
    uuid: string;
    userId: number;
    user: User;
    lessonId: number;
    lesson: Lesson;
    fromCol: number;
    toCol: number;
    fromRow: number;
    toRow: number;
    value: string;
}
