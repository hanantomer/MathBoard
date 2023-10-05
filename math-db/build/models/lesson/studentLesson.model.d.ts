import User from "../user.model";
import Lesson from "./lesson.model";
import { Model } from "sequelize-typescript";
import { StudentLessonAttributes, StudentLessonCreationAttributes } from "../../../../math-common/build/userTypes";
export default class StudentLesson extends Model<StudentLessonAttributes, StudentLessonCreationAttributes> {
    userId: number;
    user: User;
    lessonId: number;
    lesson: Lesson;
}
