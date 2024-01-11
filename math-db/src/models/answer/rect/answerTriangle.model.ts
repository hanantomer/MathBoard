import { Model, Column, BelongsTo, ForeignKey, DataType, AllowNull } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/unions";
import AnswerDecorator from "../../answer/answerDecorator";
import User from "../../user.model";
import Answer from "../../answer/answer.model";
import {
    AnswerRectAttributes,
    AnswerRectCreationAttributes,
} from "../../../../../math-common/src/answerTypes";
import { TriangleAttributes } from "../../../../../math-common/src/baseTypes";



@AnswerDecorator("AnswerTriangle")
export default class AnswerTriangle extends Model<
    AnswerRectAttributes,
    AnswerRectCreationAttributes
> {
    notationType = "TRIANGLE";
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
    fromRow!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    toRow!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    alfa!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    beta!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    gamma!: number;
}
