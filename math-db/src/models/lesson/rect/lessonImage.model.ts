import { Model, Column, BelongsTo, ForeignKey, DataType, AllowNull } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/unions";
import { UUID, UUIDV4 } from "sequelize/types/data-types";

import LessonDecorator from "../../lesson/lessonDecorator";
import User from "../../user.model";
import Color from "../../color.model";
import Lesson from "../../lesson/lesson.model";
import {
    LessonRectAttributes,
    LessonRectCreationAttributes,
} from "../../../../../math-common/src/lessonTypes";

@LessonDecorator("LessonImage")
export default class LessonImage extends Model<
    LessonRectAttributes,
    LessonRectCreationAttributes
> {
    notationType = "IMAGE";
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
    fromCol!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    toCol!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    fromRow!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    toRow!: number;

    @AllowNull(false)
    @Column({ type: DataType.TEXT })
    value!: string;

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;
}
