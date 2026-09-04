import {
    Model, Column, BelongsTo, ForeignKey, DataType, AllowNull
} from "sequelize-typescript";
import User from "../../user.model";
import Color from "../../color.model";
import Answer from "../answer.model";
import AnswerDecorator from "../answerDecorator";
import {
    AnswerConicAttributes,
    AnswerConicCreationAttributes,
} from "../../../../../math-common/build/answerTypes";
import {
    BoardType,
    NotationType,
} from "../../../../../math-common/build/unions";

@AnswerDecorator("AnswerConic")
export default class AnswerConic extends Model<
    AnswerConicAttributes,
    AnswerConicCreationAttributes
> {
    notationType: NotationType = "CONIC";
    boardType: BoardType = "ANSWER";

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
    @Column({ type: DataType.STRING })
    kind!: string;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    hx!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    hy!: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
    axis!: string;

    @AllowNull(false)
    @Column({ type: DataType.FLOAT })
    a!: number;

    @AllowNull(true)
    @Column({ type: DataType.FLOAT })
    b?: number;

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;
}
