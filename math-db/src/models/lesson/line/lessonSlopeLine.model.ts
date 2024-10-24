import {
    Model, Column, BelongsTo, ForeignKey, DataType, AllowNull
} from "sequelize-typescript";
import User from "../../user.model";
import Color from "../../color.model";
import Lesson from "../../lesson/lesson.model";
import LessonDecorator from "../../lesson/lessonDecorator";
import {
    LessonSlopeLineAttributes,
    LessonSlopeLineCreationAttributes,
} from "../../../../../math-common/src/lessonTypes";

@LessonDecorator("LessonSlopeLine")
export default class LessonSlopeLine extends Model<
    LessonSlopeLineAttributes,
    LessonSlopeLineCreationAttributes
> {
    notationType = "SlopeLINE";
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
    fromCol!: number; // col related to the lower row

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    toCol!: number; // col related to the higher row

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    fromRow!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    toRow!: number;

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;
}
