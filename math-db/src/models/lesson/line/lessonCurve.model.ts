import {
    Model, Column, BelongsTo, ForeignKey, DataType, AllowNull
} from "sequelize-typescript";
import  User from "../../user.model";
import Lesson from "../../lesson/lesson.model";
import LessonDecorator from "../../lesson/lessonDecorator";
import {
    LessonCurveAttributes,
    LessonCurveCreationAttributes,
} from "../../../../../math-common/src/lessonTypes";
import { BoardType, NotationType } from "../../../../../math-common/src/unions";

@LessonDecorator("LessonCurve")
export default class LessonCurve extends Model<
    LessonCurveAttributes,
    LessonCurveCreationAttributes
> {
    notationType: NotationType = "CURVE";
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

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    controlPoint1Col!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    controlPoint1Row!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    controlPoint2Col!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    controlPoint2Row!: number;
}
