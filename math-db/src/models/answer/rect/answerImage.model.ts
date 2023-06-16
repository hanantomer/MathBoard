import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/enum";
import { UUID, UUIDV4 } from "sequelize/types/data-types";
import { BaseModel } from "../../baseModel";
import AnswerDecorator from "../answerDecorator";
import User from "../../user.model";
import Answer from "../answer.model";

@AnswerDecorator("AnswerImage")
export default class AnswerImage extends Model implements BaseModel {
    notationType = NotationType.IMAGE;
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
    fromCol!: number;

    @Column
    toCol!: number;

    @Column
    fromRow!: number;

    @Column
    toRow!: number;

    @Column
    value!: string;
}
