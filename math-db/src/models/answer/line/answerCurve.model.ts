import {
    Model, Column, BelongsTo, ForeignKey, DataType, AllowNull
} from "sequelize-typescript";
import  User from "../../user.model";
import Answer from "../../answer/answer.model";
import AnswerDecorator from "../../answer/answerDecorator";
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
    fromCol!: number; // col related to the lower row

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    toCol!: number; // col related to the higher row

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    fromRow!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    toRow!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    controlPoint1Col!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    controlPoint1Row!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    controlPoint2Col!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    controlPoint2Row!: number;
}
