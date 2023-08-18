import AnswerDecorator from "../answerDecorator";
import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/enum";
import { UUID, UUIDV4 } from "sequelize/types/data-types";
import { User } from "@/models/user.model";
import Answer from "@/models/answer/answer.model";
import {
    AnswerLineAttributes,
    AnswerLineCreationAttributes,
} from "@/models/answer/line/answerLineAttributes";

@AnswerDecorator("AnswerRoot")
export default class AnswerRoot extends Model<AnswerLineAttributes, AnswerLineCreationAttributes> {
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
