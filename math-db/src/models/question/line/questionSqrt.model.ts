import { Model, Column, BelongsTo, ForeignKey, DataType } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/build/enum";
import User from "../../user.model";
import Question from "../question.model";
import QuestionDecorator from "../questionDecorator";
import {
    QuestionLineAttributes,
    QuestionLineCreationAttributes,
} from "../../../../../math-common/build/questionTypes";

@QuestionDecorator("QuestionSqrt")
export default class QuestionSqrt extends Model<
    QuestionLineAttributes,
    QuestionLineCreationAttributes
> {
    notationType = NotationType.SQRT;
    boardType = BoardType.QUESTION;
    value = null;

    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
    uuid!: string;

    @ForeignKey(() => User)
    userId!: number;

    @BelongsTo(() => User)
    user!: User;

    @ForeignKey(() => Question)
    questionId!: number;

    @BelongsTo(() => Question)
    question!: Question;

    @Column({ type: DataType.INTEGER })
    fromCol!: number;

    @Column({ type: DataType.INTEGER })
    toCol!: number;

    @Column({ type: DataType.INTEGER })
    row!: number;
}
