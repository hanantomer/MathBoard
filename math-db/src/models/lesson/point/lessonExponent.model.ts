import { Model, Column, BelongsTo, ForeignKey, DataType, AllowNull } from "sequelize-typescript";
import {
    LessonExponentAttributes,
    LessonExponentCreationAttributes,
} from "../../../../../math-common/src/lessonTypes";
import LessonDecorator from "../../lesson/lessonDecorator";
import User from "../../user.model";
import Color from "../../color.model";
import Lesson from "../../lesson/lesson.model";

@LessonDecorator("LessonExponent")
export default class LessonExponent extends Model<
    LessonExponentAttributes,
    LessonExponentCreationAttributes
> {
    notationType = "EXPONENT";
    boardType = "LESSON";

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
    col!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    row!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    base!: string;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    exponent!: string;

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;
}
