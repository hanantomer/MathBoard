import { Model, Column, BelongsTo, ForeignKey, DataType } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/build/enum";
import AnswerDecorator from "../../answer/answerDecorator";
import User from "../../user.model";
import Answer from "../../answer/answer.model";
import {
    AnswerRectAttributes,
    AnswerRectCreationAttributes,
} from "../../../../../math-common/build/answerTypes";



@AnswerDecorator("AnswerImage")
export default class AnswerImage extends Model<
    AnswerRectAttributes,
    AnswerRectCreationAttributes
> {
    notationType = NotationType.IMAGE;
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
    toCol!: number;

    @Column({ type: DataType.INTEGER })
    fromRow!: number;

    @Column({ type: DataType.INTEGER })
    toRow!: number;

    @Column({ type: DataType.STRING })
    value!: string;
}
