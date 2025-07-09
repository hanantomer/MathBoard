import {
    Model, Column, BelongsTo, ForeignKey, DataType, AllowNull
} from "sequelize-typescript";
import User from "../../user.model";
import Color from "../../color.model";
import Lesson from "../../lesson/lesson.model";
import LessonDecorator from "../../lesson/lessonDecorator";
import {
    LessonLineAttributes,
    LessonLineCreationAttributes,
} from "../../../../../math-common/src/lessonTypes";

@LessonDecorator("LessonLine")
export default class LessonLine extends Model<
    LessonLineAttributes,
    LessonLineCreationAttributes
> {
    notationType = "LINE";
    boardType = "ANSWER";

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
    p1x!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    p2x!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    p1y!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    p2y!: number;

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;
}
