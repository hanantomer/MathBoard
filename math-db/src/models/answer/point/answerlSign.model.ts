import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import AnswerDecorator from "../answerDecorator";
import User from "../../user.model";
import Answer from "../answer.model";

@AnswerDecorator("AnswerSign")
export default class AnswerSign extends Model {
    @ForeignKey(() => User)
    userId!: number;

    @BelongsTo(() => User)
    user!: User;

    @ForeignKey(() => Answer)
    answerId!: number;

    @BelongsTo(() => Answer)
    answer!: Answer;

    @Column
    col!: number;

    @Column
    row!: number;

    @Column
    value!: string;
}