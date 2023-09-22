import { Model } from "sequelize-typescript";
import User from "../user.model";
import { LessonAttributes, LessonCreateAttributes } from "../../../../math-common/build/lessonTypes";
export default class Lesson extends Model<LessonAttributes, LessonCreateAttributes> {
    userId: number;
    user: User;
    uuid: string;
    name: string;
}
