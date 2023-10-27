import {
    Model, Column, BelongsTo, ForeignKey, DataType, AllowNull
} from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/unions";
import  User from "../../user.model";
import Answer from "../../answer/answer.model";
import AnswerDecorator from "../../answer/answerDecorator";
import {
    AnswerLineAttributes,
    AnswerLineCreationAttributes,
} from "../../../../../math-common/src/answerTypes";

@AnswerDecorator("AnswerFraction")
export default class AnswerFraction extends Model<
    AnswerLineAttributes,
    AnswerLineCreationAttributes
> {
    notationType = "FRACTION";
    boardType = "ANSWER";

    @AllowNull(false)
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
    uuid!: string;

    @ForeignKey(() => User)
    userId!: number;

    @BelongsTo(() => User, {
        foreignKey: {
            allowNull: false,
        },
    })
    user!: User;

    @ForeignKey(() => Answer)
    answerId!: number;

    @BelongsTo(() => Answer, {
        foreignKey: {
            allowNull: false,
        },
    })
    answer!: Answer;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    fromCol!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    toCol!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    row!: number;
}
