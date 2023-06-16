import AnswerDecorator from "../answerDecorator";
import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/enum";
import { UUID, UUIDV4 } from "sequelize/types/data-types";
import { BaseModel } from "../../baseModel";
import User from "../../user.model";
import Answer from "../answer.model";


@AnswerDecorator("AnswerSqrt")
export default class AnswerSqrt extends Model implements BaseModel {
    notationType = NotationType.SQRT;
    boardType = BoardType.ANSWER;
    value = null;

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
    fromCol!: number;

    @Column
    toCol!: number;

    @Column
    row!: number;
}
