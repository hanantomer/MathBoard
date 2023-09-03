import User from "../user.model";
import Lesson from "./lesson.model";
import { Model } from "sequelize-typescript";
import { StudentLessonAttributes, StudentLessonCreateAttributes } from "../../../../math-common/build/notationTypes";
export default class StudentLesson extends Model<StudentLessonAttributes, StudentLessonCreateAttributes> {
    userId: number;
    user: User;
    lessonId: number;
    lesson: Lesson;
}
