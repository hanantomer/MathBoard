import LessonDecorator from "../lessonDecorator";
import { Model, Column, BelongsTo, ForeignKey, DataType, AllowNull } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/unions";
import { UUID, UUIDV4 } from "sequelize/types/data-types";
import {
    LessonHorizontalLineAttributes,
    LessonHorizontalLineCreationAttributes,
} from "../../../../../math-common/src/lessonTypes";
import User from "../../user.model";
import Lesson from "../../lesson/lesson.model";

@LessonDecorator("LessonSqrt")
export default class LessonSqrt extends Model<
    LessonHorizontalLineAttributes,
    LessonHorizontalLineCreationAttributes
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
