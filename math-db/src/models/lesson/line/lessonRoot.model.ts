import LessonDecorator from "../lessonDecorator";
import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/enum";
import { UUID, UUIDV4 } from "sequelize/types/data-types";
import User from "@/models/user.model";
import Lesson from "@/models/lesson/lesson.model";
import {
    LessonLineAttributes,
    LessonLineCreationAttributes,
} from "@/models/lesson/line/lessonLineAttributes";
@LessonDecorator("LessonRoot")
export default class LessonRoot extends Model<
    LessonLineAttributes,
    LessonLineCreationAttributes
> {
    notationType = NotationType.SQRT;
    boardType = BoardType.LESSON;
    value = null;

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
    fromCol!: number;

    @Column
    toCol!: number;

    @Column
    row!: number;
}
