import { Model } from "sequelize-typescript";
import { LessonLineAttributes, LessonLineCreationAttributes } from "../../../../../math-common/build/lessonTypes";
import User from "../../user.model";
import Lesson from "../../lesson/lesson.model";
export default class LessonSqrt extends Model<LessonLineAttributes, LessonLineCreationAttributes> {
    notationType: string;
    boardType: string;
    value: null;
    uuid: string;
    userId: number;
    user: User;
    lessonId: number;
    lesson: Lesson;
    fromCol: number;
    toCol: number;
    row: number;
}
