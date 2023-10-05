import { Model } from "sequelize-typescript";
import User from "../user.model";
import Lesson from "../lesson/lesson.model";
import { QuestionAttributes, QuestionCreateAttributes } from "../../../../math-common/build/questionTypes";
export default class Question extends Model<QuestionAttributes, QuestionCreateAttributes> {
    user: User;
    lesson: Lesson;
    uuid: string;
    name: string;
}
