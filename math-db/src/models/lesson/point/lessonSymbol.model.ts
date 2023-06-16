import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/enum";
import { UUID, UUIDV4 } from "sequelize";
import { BaseModel } from "../../baseModel";
import LessonDecorator from "../lessonDecorator";
import User from "../../user.model";
import Lesson from "../lesson.model";


@LessonDecorator("LessonSymbol")
export default class LessonSymbol extends Model implements BaseModel {
    notationType = NotationType.SYMBOL;
    boardType = BoardType.LESSON;

    @Column({ type: UUID, defaultValue: UUIDV4 })
    uuid!: string;

    @ForeignKey(() => User)
    userId!: number;

    @BelongsTo(() => User)
    user!: User;

    @ForeignKey(() => Lesson)
    lessonId!: number;

    @BelongsTo(() => Lesson)
    lesson!: Lesson;

    @Column
    col!: number;

    @Column
    row!: number;

    @Column
    value!: string;
}
