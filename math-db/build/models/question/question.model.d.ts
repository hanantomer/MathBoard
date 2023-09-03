import { Model } from "sequelize-typescript";
import User from "../user.model";
import Lesson from "../lesson/lesson.model";
import { QuestionAttributes, QuestionCreateAttributes } from "../../../../math-common/build/notationTypes";
export default class Question extends Model<QuestionAttributes, QuestionCreateAttributes> {
    userId: number;
    user: User;
    lessonId: number;
    lesson: Lesson;
    uuid: string;
    name: string;
}
