import { Model, Column, BelongsTo, ForeignKey, DataType } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/build/enum";
import { UUID, UUIDV4 } from "sequelize/types/data-types";
import {
    LessonPointAttributes,
    LessonPointCreationAttributes,
} from "../../../../../math-common/build/lessonTypes";
import LessonDecorator from "../../lesson/lessonDecorator";
import User from "../../user.model";
import Lesson from "../../lesson/lesson.model";

@LessonDecorator("LessonPower")
export default class LessonPower extends Model<
    LessonPointAttributes,
    LessonPointCreationAttributes
> {
    notationType = NotationType.POWER;
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
    col!: number;

    @Column({ type: DataType.INTEGER })
    row!: number;

    @Column({ type: DataType.STRING })
    value!: string;
}
