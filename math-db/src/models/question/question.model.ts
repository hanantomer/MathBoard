import { Model, Column, DataType, BelongsTo, ForeignKey, AllowNull, NotNull } from "sequelize-typescript";
import BoardDecorator from "../boardDecorator";
import User from "../user.model";
import Lesson from "../lesson/lesson.model";
import {
    QuestionAttributes,
    QuestionCreationAttributes,
} from "../../../../math-common/src/questionTypes";


@BoardDecorator("question")
export default class Question extends Model<
    QuestionAttributes,
    QuestionCreationAttributes
> {
    // @Column({
    //     type: DataType.NUMBER,
    // })
    // userId!: number;

    // @Column({
    //     type: DataType.NUMBER,
    // })
    // lessonId!: number;

    @BelongsTo(() => User, "userId")
    user!: User;

    @BelongsTo(() => Lesson, "lessonId")
    lesson!: Lesson;

    @AllowNull(false)
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    uuid!: string;

    @AllowNull(false)
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    name!: string;
}
