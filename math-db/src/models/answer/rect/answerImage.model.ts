import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/enum";
import { UUID, UUIDV4 } from "sequelize/types/data-types";
import AnswerDecorator from "@/models/answer/answerDecorator";
import { User } from "@/models/user.model";
import Answer from "@/models/answer/answer.model";
import {
    AnswerRectAttributes,
    AnswerRectCreationAttributes,
} from "@/models/answer/rect/answerRectAttributes";



@AnswerDecorator("AnswerImage")
export default class AnswerImage extends Model<AnswerRectAttributes, AnswerRectCreationAttributes> {
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
