import { Model, Column, BelongsTo, ForeignKey, DataType, NotNull, AllowNull  } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/unions";
import {LessonLineAttributes, LessonLineCreationAttributes} from "../../../../../math-common/build/lessonTypes";
import User from "../../user.model";
import Lesson from "../../lesson/lesson.model";
import LessonDecorator from "../../lesson/lessonDecorator";


@LessonDecorator("LessonFraction")
export default class LessonFraction extends Model<
    LessonLineAttributes,
    LessonLineCreationAttributes
> {
    notationType = "FRACTION";
    boardType = "LESSON";
    value = null;

    @AllowNull(false)
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
    uuid!: string;

    @ForeignKey(() => User)
    userId!: number;

    @BelongsTo(() => User, {
        foreignKey: {
            allowNull: false,
        },
    })
    user!: User;

    @ForeignKey(() => Lesson)
    lessonId!: number;

    @BelongsTo(() => Lesson, {
        foreignKey: {
            allowNull: false,
        },
    })
    lesson!: Lesson;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    fromCol!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    toCol!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    row!: number;
}
