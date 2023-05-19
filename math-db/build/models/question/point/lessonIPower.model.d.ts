import { Model } from "sequelize-typescript";
import User from "../../user.model";
import Lesson from "../lesson.model";
export default class LessonPower extends Model {
    userId: number;
    user: User;
    lessonId: number;
    lesson: Lesson;
    col: number;
    row: number;
    value: string;
}
