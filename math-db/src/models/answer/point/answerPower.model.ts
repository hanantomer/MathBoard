import { Model, Column, BelongsTo, ForeignKey, DataType, AllowNull } from "sequelize-typescript";
import AnswerDecorator from "../../answer/answerDecorator";
import  User from "../../user.model";
import Answer from "../../answer/answer.model";
import {
    AnswerPointAttributes,
    AnswerPointCreationAttributes,
} from "../../../../../math-common/src/answerTypes";



@AnswerDecorator("AnswerPower")
export default class AnswerPower extends Model<
    AnswerPointAttributes,
    AnswerPointCreationAttributes
> {
    notationType = "POWER";
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
    @Column({ type: DataType.INTEGER })
    value!: string;
}
