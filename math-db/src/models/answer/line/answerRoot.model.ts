import AnswerDecorator from "../answerDecorator";
import { Model, Column, BelongsTo, ForeignKey, DataType, AllowNull} from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/unions";
import User from "../../user.model";
import Answer from "../../answer/answer.model";
import {
    AnswerLineAttributes,
    AnswerLineCreationAttributes,
} from "../../../../../math-common/src/answerTypes";

@AnswerDecorator("AnswerRoot")
export default class AnswerRoot extends Model<
    AnswerLineAttributes,
    AnswerLineCreationAttributes
> {
    notationType = "SQRT";
    boardType = "ANSWER";
    value = null;

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
