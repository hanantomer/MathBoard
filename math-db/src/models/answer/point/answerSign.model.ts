import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/enum";
import { UUID, UUIDV4 } from "sequelize/types/data-types";
import AnswerDecorator from "../answerDecorator";
import User from "../../user.model";
import Answer from "../answer.model";
import {
    AnswerPointAttributes,
    AnswerPointCreationAttributes,
} from "@/models/answer/point/answerPointAttributes";


@AnswerDecorator("AnswerSign")
export default class AnswerSign extends Model<AnswerPointAttributes, AnswerPointCreationAttributes> {
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
