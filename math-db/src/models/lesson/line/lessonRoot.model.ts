import LessonDecorator from "../lessonDecorator";
import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import User from "../../user.model";
import Lesson from "../lesson.model";

@LessonDecorator("LessonRoot")
export default class LessonRoot extends Model {
    @ForeignKey(() => User)
    userId!: number;

    @BelongsTo(() => User)
    user!: User;

    @ForeignKey(() => Lesson)
    lessonId!: number;

    @BelongsTo(() => Lesson)
    lesson!: Lesson;

    @Column
    fromCol!: number;

    @Column
    toCol!: number;

    @Column
    row!: number;
}
