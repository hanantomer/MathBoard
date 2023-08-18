import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/enum";
import { UUID, UUIDV4 } from "sequelize";
import { LessonPointAttributes, LessonPointCreationAttributes } from "@/models/lesson/point/lessonPointAttributes";
import LessonDecorator from "@/models/lesson/lessonDecorator";
import { User } from "@/models/user.model";
import Lesson from "@/models/lesson/lesson.model";


@LessonDecorator("LessonSymbol")
export default class LessonSymbol extends Model<LessonPointAttributes, LessonPointCreationAttributes>
{
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
