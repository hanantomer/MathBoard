import {
    Model, Column, BelongsTo, ForeignKey, DataType, AllowNull
} from "sequelize-typescript";
import User from "../../user.model";
import Color from "../../color.model";
import Answer from "../../answer/answer.model";
import AnswerDecorator from "../../answer/answerDecorator";
import {
    AnswerLineAttributes,
    AnswerLineCreationAttributes,
} from "../../../../../math-common/src/answerTypes";

@AnswerDecorator("AnswerLine")
export default class AnswerLine extends Model<
    AnswerLineAttributes,
    AnswerLineCreationAttributes
> {
    notationType = "LINE";
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
    p1x!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    p2x!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    p1y!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    p2y!: number;

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;
}
