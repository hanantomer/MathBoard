import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/enum";
import { UUID, UUIDV4 } from "sequelize/types/data-types";
import AnswerDecorator from "@/models/answer/answerDecorator";
import User from "@/models/user.model";
import Answer from "@/models/answer/answer.model";
import {
    AnswerPointAttributes,
    AnswerPointCreationAttributes,
} from "@/models/answer/point/answerPointAttributes";



@AnswerDecorator("AnswerPower")
export default class AnswerPower
    extends Model<AnswerPointAttributes, AnswerPointCreationAttributes>
{
    notationType = NotationType.POWER;
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
