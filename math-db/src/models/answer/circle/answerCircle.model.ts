import {
    Model, Column, BelongsTo, ForeignKey, DataType, AllowNull
} from "sequelize-typescript";
import User from "../../user.model";
import Color from "../../color.model";
import Answer from "../answer.model";
import AnswerDecorator from "../answerDecorator";
import {
    AnswerCircleAttributes,
    AnswerCircleCreationAttributes,
} from "../../../../../math-common/src/answerTypes";
import { BoardType, NotationType } from "../../../../../math-common/build/unions";

@AnswerDecorator("AnswerCircle")
export default class AnswerCircle extends Model<
    AnswerCircleAttributes,
    AnswerCircleCreationAttributes
> {
    notationType: NotationType = "CIRCLE";
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
    cx!: number;  

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    cy!: number; 

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    r!: number;

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;
}
