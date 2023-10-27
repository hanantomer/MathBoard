import { Model, Column, BelongsTo, ForeignKey, DataType, AllowNull } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/unions";
import AnswerDecorator from "../../answer/answerDecorator";
import User from "../../user.model";
import Answer from "../../answer/answer.model";
import {
    AnswerRectAttributes,
    AnswerRectCreationAttributes,
} from "../../../../../math-common/src/answerTypes";



@AnswerDecorator("AnswerGeo")
export default class AnswerGeo extends Model<
    AnswerRectAttributes,
    AnswerRectCreationAttributes
> {
    notationType = "TEXT";
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
    @Column({ type: DataType.STRING })
    value!: string;
}
