import { Model } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/build/enum";
import User from "../../user.model";
import Lesson from "../../lesson/lesson.model";
import { LessonRectAttributes, LessonRectCreationAttributes } from "../../../../../math-common/build/lessonTypes";
export default class LessonImage extends Model<LessonRectAttributes, LessonRectCreationAttributes> {
    notationType: NotationType;
    boardType: BoardType;
    uuid: string;
    userId: number;
    user: User;
    lessonId: number;
    lesson: Lesson;
    fromCol: number;
    toCol: number;
    fromRow: number;
    toRow: number;
    value: string;
}
