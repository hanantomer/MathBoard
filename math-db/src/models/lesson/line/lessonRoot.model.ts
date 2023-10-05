import LessonDecorator from "../lessonDecorator";
import { Model, Column, BelongsTo, ForeignKey, DataType, AllowNull } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/unions";
import { UUID, UUIDV4 } from "sequelize/types/data-types";
import User from "../../user.model";
import Lesson from "../../lesson/lesson.model";
import {
    LessonLineAttributes,
    LessonLineCreationAttributes,
} from "../../../../../math-common/build/lessonTypes";
@LessonDecorator("LessonRoot")
export default class LessonRoot extends Model<
    LessonLineAttributes,
    LessonLineCreationAttributes
> {
    notationType = "SQRT";
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

