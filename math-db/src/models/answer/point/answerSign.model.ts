import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/enum";
import { UUID, UUIDV4 } from "sequelize/types/data-types";
import { BaseModel } from "../../baseModel";
import AnswerDecorator from "../answerDecorator";
import User from "../../user.model";
import Answer from "../answer.model";

@AnswerDecorator("AnswerSign")
export default class AnswerSign extends Model implements BaseModel {
    notationType = NotationType.SIGN;
    boardType = BoardType.ANSWER;
    
    @Column({ type: UUID, defaultValue: UUIDV4 })
    uuid!: string;

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