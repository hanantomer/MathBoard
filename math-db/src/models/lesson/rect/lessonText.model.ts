import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/enum";
import { UUID, UUIDV4 } from "sequelize/types/data-types";
import LessonDecorator from "@/models/lesson/lessonDecorator";
import { User } from "@/models/user.model";
import Lesson from "@/models/lesson/lesson.model";
import { LessonRectAttributes, LessonRectCreateAttributes } from "@/models/lesson/rect/lessonRectAttributes";

@LessonDecorator("LessonText")
export default class LessonText extends Model<
    LessonRectAttributes,
    LessonRectCreateAttributes
> {
    notationType = NotationType.TEXT;
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
    fromCol!: number;

    @Column
    toCol!: number;

    @Column
    fromRow!: number;

    @Column
    toRow!: number;

    @Column
    value!: string;
}
