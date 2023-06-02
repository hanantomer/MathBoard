import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/enum";
import { UUID, UUIDV4 } from "sequelize/types/data-types";
import { BaseModel } from "../../baseModel"
import User from "../../user.model";
import Answer from "../answer.model";
import AnswerDecorator from "../answerDecorator";

@AnswerDecorator("AnswerFraction")
export default class AnswerFraction extends Model implements BaseModel {
    notationType: NotationType = NotationType.FRACTION;
    boardType: BoardType = BoardType.ANSWER;
    selected: boolean = false;

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
