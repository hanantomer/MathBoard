import { Model, Column, DataType, BelongsTo, ForeignKey, AllowNull, NotNull } from "sequelize-typescript";
import BoardDecorator from "../boardDecorator";
import User from "../user.model";
import Lesson from "../lesson/lesson.model";
import {
    QuestionAttributes,
    QuestionCreateAttributes,
} from "../../../../math-common/src/questionTypes";


@BoardDecorator("question")
export default class Question extends Model<
    QuestionAttributes,
    QuestionCreateAttributes
> {
    @BelongsTo(() => User, {
        foreignKey: {
            allowNull: false,
            field: "userId",
            name: "userIdFK",
        },
    })
    user!: User;

    @BelongsTo(() => Lesson, {
        foreignKey: {
            allowNull: false,
            field: "lessonId",
            name: "lessonIdFK",
        },
    })
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
