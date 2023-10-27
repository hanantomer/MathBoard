import { Model, Column, BelongsTo, ForeignKey, DataType, AllowNull } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/unions";
import {
    QuestionLineAttributes,
    QuestionLineCreationAttributes,
} from "../../../../../math-common/src/questionTypes";
import User from "../../user.model";
import Question from "../../question/question.model";
import QuestionDecorator from "../../question/questionDecorator";

@QuestionDecorator("QuestionFraction")
export default class QuestionFraction extends Model<
    QuestionLineAttributes,
    QuestionLineCreationAttributes
> {
    notationType = "FRACTION";
    boardType = "QUESTION";
    value = null;

    @AllowNull(false)
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
    uuid!: string;

    @ForeignKey(() => User)
    userId!: number;

    @BelongsTo(() => User, {
        foreignKey: {
            allowNull: false,
        },
    })
    user!: User;

    @ForeignKey(() => Question)
    questionId!: number;

    @BelongsTo(() => Question, {
        foreignKey: {
            allowNull: false,
        },
    })
    question!: Question;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    fromCol!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    toCol!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    row!: number;
}
