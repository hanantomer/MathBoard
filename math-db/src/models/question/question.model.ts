import {
    Model,
    Column,
    DataType,
    BelongsTo,
    ForeignKey,
    AllowNull,
    HasOne,
} from "sequelize-typescript";
import BoardDecorator from "../boardDecorator";
import User from "../user.model";
import Lesson from "../lesson/lesson.model";
import PracticeQuestion from "../practice/practiceQuestion.model";
import {
    QuestionAttributes,
    QuestionCreationAttributes,
} from "../../../../math-common/build/questionTypes";

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

    @AllowNull(true)
    @ForeignKey(() => Lesson)
    @Column({ type: DataType.INTEGER })
    lessonId!: number | null;

    @BelongsTo(() => Lesson, {
        foreignKey: { name: "lessonId", field: "lessonId", allowNull: true },
    })
    lesson!: Lesson | null;

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

    @HasOne(() => PracticeQuestion, {
        foreignKey: "questionId",
        as: "practice",
    })
    practice!: PracticeQuestion | null;
}
