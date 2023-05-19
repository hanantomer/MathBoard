import AnswerDecorator from "../answerDecorator";
import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import User from "../../user.model";
import Answer from "../answer.model";

@AnswerDecorator("AnswerRoot")
export default class AnswerRoot extends Model {
    @ForeignKey(() => User)
    userId!: number;

    @BelongsTo(() => User)
    user!: User;

    @ForeignKey(() => Answer)
    answerId!: number;

    @BelongsTo(() => Answer)
    answer!: Answer;

    @Column
    fromCol!: number;

    @Column
    toCol!: number;

    @Column
    row!: number;
}
