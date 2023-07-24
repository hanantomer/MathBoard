import { Model, Column, DataType, BelongsTo, ForeignKey } from "sequelize-typescript";
import { Optional } from "sequelize";
import BoardDecorator from "../boardDecorator";
import User from "../user.model";
import Lesson from "../lesson/lesson.model";


export interface QuestionAttributes {
    id: number;
    userId: number;
    lessonUUID: string;
    user: User;
    uuid: string;
    name: string;
}

interface QuestionCreationAttributes
    extends Optional<QuestionAttributes, "id"> {}

@BoardDecorator("question")
export default class Question extends Model<
    QuestionAttributes,
    QuestionCreationAttributes
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
