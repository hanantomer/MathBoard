import { Model } from "sequelize-typescript";
import User from "../user.model";
import { LessonAttributes, LessonCreationAttributes } from "../../../../math-common/build/lessonTypes";
export default class Lesson extends Model<LessonAttributes, LessonCreationAttributes> {
    userId: number;
    user: User;
    uuid: string;
    name: string;
}
