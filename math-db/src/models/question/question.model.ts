import {
    Model,
    Column,
    DataType,
    BelongsTo,
    ForeignKey,
    AllowNull,
} from "sequelize-typescript";
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
        foreignKey: { name: "lessonId", field: "lessonId", allowNull: false },
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
        type: DataType.STRING,
    })
    name!: string;
}
