import LessonDecorator from "../../lesson/lessonDecorator";
import { Model, Column, BelongsTo, ForeignKey, DataType, AllowNull } from "sequelize-typescript";
import {
    NotationType,
    BoardType,
} from "../../../../../math-common/build/unions";
import User from "../../user.model";
import Color from "../../color.model";
import Lesson from "../../lesson/lesson.model";
import {
    LessonAnnotationAttributes,
    LessonAnnotationCreationAttributes,
} from "../../../../../math-common/build/lessonTypes";

        
@LessonDecorator("LessonAnnotation")
export default class LessonAnnotation extends Model<
    LessonAnnotationAttributes,
    LessonAnnotationCreationAttributes
> {
    notationType: NotationType = "ANNOTATION";
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
    @Column({ type: DataType.INTEGER })
    x!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    y!: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
    value!: string;

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;

    @Column({ type: DataType.INTEGER, allowNull: true })
    rotation?: number;
}
