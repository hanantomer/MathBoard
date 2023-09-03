import { Model, Column, BelongsTo, ForeignKey, DataType } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/build/enum";
import QuestionDecorator from "../questionDecorator";
import User from "../../user.model";
import Question from "../question.model";
import {
    QuestionPointAttributes,
    QuestionPointCreationAttributes,
} from "../../../../../math-common/build/notationTypes";

@QuestionDecorator("QuestionPower")
export default class QuestionPower extends Model<
    QuestionPointAttributes,
    QuestionPointCreationAttributes
> {
    notationType = NotationType.POWER;
    boardType = BoardType.QUESTION;

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
    col!: number;

    @Column({ type: DataType.INTEGER })
    row!: number;

    @Column({ type: DataType.STRING })
    value!: string;
}
