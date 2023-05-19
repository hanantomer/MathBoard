import { Model } from "sequelize-typescript";
import User from "../../user.model";
import Lesson from "../lesson.model";
export default class LessonImage extends Model {
    userId: number;
    user: User;
    lessonId: number;
    lesson: Lesson;
    fromCol: number;
    toCol: number;
    fromRow: number;
    toRow: number;
}
