import User from "../user.model";
import Lesson from "./lesson.model";
import { Model } from "sequelize-typescript";
export default class StudentLesson extends Model {
    userId: number;
    user: User;
    lessonId: number;
    lesson: Lesson;
}
