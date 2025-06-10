import { Model, Column, BelongsTo, ForeignKey, DataType, AllowNull } from "sequelize-typescript";
import AnswerDecorator from "../../answer/answerDecorator";
import User from "../../user.model";
import Color from "../../color.model";
import Answer from "../../answer/answer.model";
import { AnswerPointAttributes, AnswerPointCreationAttributes } from "../../../../../math-common/src/answerTypes";

@AnswerDecorator("AnswerLogBase")
export default class AnswerLogBase extends Model<
    AnswerPointAttributes,
    AnswerPointCreationAttributes
> {
    notationType = "LOGBASE";
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
    col!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    row!: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
    value!: string;

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;
}