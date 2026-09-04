import {
    Model, Column, BelongsTo, ForeignKey, DataType, AllowNull
} from "sequelize-typescript";
import User from "../../user.model";
import Color from "../../color.model";
import Lesson from "../lesson.model";
import LessonDecorator from "../lessonDecorator";
import {
    LessonConicAttributes,
    LessonConicCreationAttributes,
} from "../../../../../math-common/build/lessonTypes";
import {
    BoardType,
    NotationType,
} from "../../../../../math-common/build/unions";

@LessonDecorator("LessonConic")
export default class LessonConic extends Model<
    LessonConicAttributes,
    LessonConicCreationAttributes
> {
    notationType: NotationType = "CONIC";
    boardType: BoardType = "LESSON";

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
    @Column({ type: DataType.STRING })
    kind!: string;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    hx!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    hy!: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
    axis!: string;

    @AllowNull(false)
    @Column({ type: DataType.FLOAT })
    a!: number;

    @AllowNull(true)
    @Column({ type: DataType.FLOAT })
    b?: number;

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;
}
