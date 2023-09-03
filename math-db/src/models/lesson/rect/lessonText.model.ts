import { Model, Column, BelongsTo, ForeignKey, DataType } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/build/enum";
import LessonDecorator from "../../lesson/lessonDecorator";
import User from "../../user.model";
import Lesson from "../../lesson/lesson.model";
import {
    LessonRectAttributes,
    LessonRectCreateAttributes,
} from "../../../../../math-common/build/notationTypes";

@LessonDecorator("LessonText")
export default class LessonText extends Model<
    LessonRectAttributes,
    LessonRectCreateAttributes
> {
    notationType = NotationType.TEXT;
    boardType = BoardType.LESSON;

    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
    uuid!: string;

    @ForeignKey(() => User)
    userId!: number;

    @BelongsTo(() => User)
    user!: User;

    @ForeignKey(() => Lesson)
    lessonId!: number;

    @BelongsTo(() => Lesson)
    lesson!: Lesson;

    @Column({ type: DataType.INTEGER })
    fromCol!: number;

    @Column({ type: DataType.INTEGER })
    toCol!: number;

    @Column({ type: DataType.INTEGER })
    fromRow!: number;

    @Column({ type: DataType.INTEGER })
    toRow!: number;

    @Column({ type: DataType.STRING })
    value!: string;
}
