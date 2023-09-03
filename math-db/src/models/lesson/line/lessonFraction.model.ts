import { Model, Column, BelongsTo, ForeignKey, DataType } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/build/enum";
import {LessonLineAttributes, LessonLineCreationAttributes} from "../../../../../math-common/build/notationTypes";
import User from "../../user.model";
import Lesson from "../../lesson/lesson.model";
import LessonDecorator from "../../lesson/lessonDecorator";


@LessonDecorator("LessonFraction")
export default class LessonFraction extends Model<
    LessonLineAttributes,
    LessonLineCreationAttributes
> {
    notationType = NotationType.FRACTION;
    boardType = BoardType.LESSON;
    value = null;

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
    row!: number;
}
