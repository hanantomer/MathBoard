import { Model, Column, BelongsTo, ForeignKey, DataType, AllowNull } from "sequelize-typescript";
import AnswerDecorator from "../../answer/answerDecorator";
import User from "../../user.model";
import Color from "../../color.model";
import Answer from "../../answer/answer.model";
import { AnswerPointAttributes, AnswerPointCreationAttributes } from "../../../../../math-common/src/answerTypes";

@AnswerDecorator("AnswerExponent")
export default class AnswerExponent extends Model<
    AnswerPointAttributes,
    AnswerPointCreationAttributes
> {
    notationType = "EXPONENT_STARTED";
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

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    base!: string;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    exponent!: string;

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;
}
