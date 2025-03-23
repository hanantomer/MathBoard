import {
    Model, Column, BelongsTo, ForeignKey, DataType, AllowNull
} from "sequelize-typescript";
import User from "../../user.model";
import Color from "../../color.model";
import Answer from "../answer.model";
import AnswerDecorator from "../answerDecorator";
import {
    AnswerCurveAttributes,
    AnswerCurveCreationAttributes,
} from "../../../../../math-common/src/answerTypes";
import { BoardType, NotationType } from "../../../../../math-common/src/unions";

@AnswerDecorator("AnswerCurve")
export default class AnswerCurve extends Model<
    AnswerCurveAttributes,
    AnswerCurveCreationAttributes
> {
    notationType: NotationType = "CURVE";
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
    @Column({ type: DataType.INTEGER })
    p1x!: number; // col related to the lower row

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    p2x!: number; // col related to the higher row

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    p1y!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    p2y!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    cpx!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    cpy!: number;

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;
}
