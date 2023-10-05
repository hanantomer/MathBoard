import { Model } from "sequelize-typescript";
import User from "../../user.model";
import Lesson from "../../lesson/lesson.model";
import { LessonLineAttributes, LessonLineCreationAttributes } from "../../../../../math-common/build/lessonTypes";
export default class LessonRoot extends Model<LessonLineAttributes, LessonLineCreationAttributes> {
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
