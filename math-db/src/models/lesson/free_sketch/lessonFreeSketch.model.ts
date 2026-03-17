import {
    Model, Column, BelongsTo, ForeignKey, DataType, AllowNull
} from "sequelize-typescript";
import User from "../../user.model";
import Color from "../../color.model";
import Lesson from "../lesson.model";
import LessonDecorator from "../lessonDecorator";
import {
    LessonFreeSketchAttributes,
    LessonFreeSketchCreationAttributes,
} from "../../../../../math-common/build/lessonTypes";
import {
    BoardType,
    NotationType,
} from "../../../../../math-common/build/unions";

@LessonDecorator("LessonFreeSketch")
export default class LessonFreeSketch extends Model<
    LessonFreeSketchAttributes,
    LessonFreeSketchCreationAttributes
> {
    notationType: NotationType = "FREESKETCH";
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
    @Column({ type: DataType.JSON })
    points!: { x: number; y: number }[];

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;
}