import { Model, Column, BelongsTo, ForeignKey, DataType, AllowNull, Unique } from "sequelize-typescript";
import {
    LessonPointAttributes,
    LessonPointCreationAttributes,
} from "../../../../../math-common/src/lessonTypes";
import LessonDecorator from "../../lesson/lessonDecorator";
import User from "../../user.model";
import Lesson from "../../lesson/lesson.model";

@LessonDecorator("LessonSymbol")
export default class LessonSymbol extends Model<
    LessonPointAttributes,
    LessonPointCreationAttributes
> {
    notationType = "SYMBOL";
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
    @Column({
        field: "lessonId",
        type: DataType.NUMBER,
        unique: "active_unique",
    })
    lessonId!: number;

    @BelongsTo(() => Lesson, {
        foreignKey: {
            allowNull: false,
        },
    })
    lesson!: Lesson;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER, unique: "active_unique" })
    col!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER, unique: "active_unique" })
    row!: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
    value!: string;
}
