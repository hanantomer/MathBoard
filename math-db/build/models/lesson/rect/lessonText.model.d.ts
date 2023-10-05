import { Model } from "sequelize-typescript";
import User from "../../user.model";
import Lesson from "../../lesson/lesson.model";
import { LessonRectAttributes, LessonRectCreationAttributes } from "../../../../../math-common/build/lessonTypes";
export default class LessonText extends Model<LessonRectAttributes, LessonRectCreationAttributes> {
    notationType: string;
    boardType: string;
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
