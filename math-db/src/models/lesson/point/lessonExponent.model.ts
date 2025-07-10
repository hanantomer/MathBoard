import { Model, Column, BelongsTo, ForeignKey, DataType, AllowNull } from "sequelize-typescript";
import LessonDecorator from "../../lesson/lessonDecorator";
import User from "../../user.model";
import Color from "../../color.model";
import Lesson from "../../lesson/lesson.model";
import { LessonPointAttributes, LessonPointCreationAttributes } from "../../../../../math-common/src/lessonTypes";

@LessonDecorator("LessonExponent")
export default class LessonExponent extends Model<
    LessonPointAttributes,
    LessonPointCreationAttributes
> {
    notationType = "EXPONENT_STARTED";
    boardType = "Lesson";

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
    @Column({ type: DataType.STRING })
    value!: string;

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;
}
