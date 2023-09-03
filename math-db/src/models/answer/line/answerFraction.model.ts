import {
    Model, Column, BelongsTo, ForeignKey, DataType
} from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/build/enum";
import  User from "../../user.model";
import Answer from "../../answer/answer.model";
import AnswerDecorator from "../../answer/answerDecorator";
import {
    AnswerLineAttributes,
    AnswerLineCreationAttributes,
} from "../../../../../math-common/build/notationTypes";

@AnswerDecorator("AnswerFraction")
export default class AnswerFraction extends Model<
    AnswerLineAttributes,
    AnswerLineCreationAttributes
> {
    notationType = NotationType.FRACTION;
    boardType = BoardType.ANSWER;

    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
    uuid!: string;

    @ForeignKey(() => User)
    userId!: number;

    @BelongsTo(() => User)
    user!: User;

    @ForeignKey(() => Answer)
    answerId!: number;

    @BelongsTo(() => Answer)
    answer!: Answer;

    @Column({ type: DataType.INTEGER })
    fromCol!: number;

    @Column({ type: DataType.INTEGER })
    toCol!: number;

    @Column({ type: DataType.INTEGER })
    row!: number;
}
