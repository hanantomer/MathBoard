import AnswerDecorator from "../../answer/answerDecorator";
import { Model, Column, BelongsTo, ForeignKey, DataType, AllowNull } from "sequelize-typescript";
import {
    NotationType,
    BoardType,
} from "../../../../../math-common/build/unions";
import User from "../../user.model";
import Color from "../../color.model";
import Answer from "../../answer/answer.model";
import {
    AnswerPointAttributes,
    AnswerPointCreationAttributes,
} from "../../../../../math-common/build/answerTypes";

        
@AnswerDecorator("AnswerAnnotation")
export default class AnswerAnnotation extends Model<
    AnswerPointAttributes,
    AnswerPointCreationAttributes
> {
    notationType: NotationType = "ANNOTATION";
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
    x!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    y!: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
    value!: string;

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;

    @Column({ type: DataType.INTEGER, allowNull: true })
    rotation?: number;
}
