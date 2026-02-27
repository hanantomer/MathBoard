import {
    Model, Column, BelongsTo, ForeignKey, DataType, AllowNull
} from "sequelize-typescript";
import User from "../../user.model";
import Color from "../../color.model";
import Lesson from "../lesson.model";
import LessonDecorator from "../lessonDecorator";
import {
    LessonCircleAttributes,
    LessonCircleCreationAttributes,
} from "../../../../../math-common/build/lessonTypes";
import {
    BoardType,
    NotationType,
} from "../../../../../math-common/build/unions";

@LessonDecorator("LessonCircle")
export default class LessonCircle extends Model<
    LessonCircleAttributes,
    LessonCircleCreationAttributes
> {
    notationType: NotationType = "CIRCLE";
    boardType: BoardType = "ANSWER";

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
    cx!: number;  

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    cy!: number; 

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    r!: number;

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;
}
