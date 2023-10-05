import { Model } from "sequelize-typescript";
import { LessonPointAttributes, LessonPointCreationAttributes } from "../../../../../math-common/build/lessonTypes";
import User from "../../user.model";
import Lesson from "../../lesson/lesson.model";
export default class LessonSign extends Model<LessonPointAttributes, LessonPointCreationAttributes> {
    notationType: string;
    boardType: string;
    uuid: string;
    userId: number;
    user: User;
    lessonId: number;
    lesson: Lesson;
    col: number;
    row: number;
    value: string;
}
