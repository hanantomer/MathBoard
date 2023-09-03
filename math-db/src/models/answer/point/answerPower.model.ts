import { Model, Column, BelongsTo, ForeignKey, DataType } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/build/enum";
import { UUID, UUIDV4 } from "sequelize/types/data-types";
import AnswerDecorator from "../../answer/answerDecorator";
import  User from "../../user.model";
import Answer from "../../answer/answer.model";
import {
    AnswerPointAttributes,
    AnswerPointCreationAttributes,
} from "../../../../../math-common/build/notationTypes";



@AnswerDecorator("AnswerPower")
export default class AnswerPower extends Model<
    AnswerPointAttributes,
    AnswerPointCreationAttributes
> {
    notationType = NotationType.POWER;
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
    col!: number;

    @Column({ type: DataType.INTEGER })
    row!: number;

    @Column({ type: DataType.INTEGER })
    value!: string;
}
