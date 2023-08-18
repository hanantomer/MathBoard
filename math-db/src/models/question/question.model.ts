import { Model, Column, DataType, BelongsTo, ForeignKey } from "sequelize-typescript";
import { Optional } from "sequelize";
import BoardDecorator from "../boardDecorator";
import { User } from "../user.model";
import Lesson, { LessonAttributes } from "../lesson/lesson.model";


export interface QuestionAttributes {
    id: number;
    userId: number;
    lesson: LessonAttributes;
    user: User;
    uuid: string;
    name: string;
    createdAt: Date;
}

export interface QuestionCreateAttributes
    extends Optional<QuestionAttributes, "id"> {}

@BoardDecorator("question")
export default class Question extends Model<
    QuestionAttributes,
    QuestionCreateAttributes
> {
    @ForeignKey(() => User)
    userId!: number;

    @BelongsTo(() => User)
    user!: User;

    @ForeignKey(() => Lesson)
    lessonId!: number;

    @BelongsTo(() => Lesson)
    lesson!: Lesson;

    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    uuid!: string;

    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    name!: string;
}
