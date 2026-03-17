import {
    Model, Column, BelongsTo, ForeignKey, DataType, AllowNull
} from "sequelize-typescript";
import User from "../../user.model";
import Color from "../../color.model";
import Answer from "../answer.model";
import AnswerDecorator from "../answerDecorator";
import {
    AnswerFreeSketchAttributes,
    AnswerFreeSketchCreationAttributes,
} from "../../../../../math-common/build/answerTypes";
import {
    BoardType,
    NotationType,
} from "../../../../../math-common/build/unions";

@AnswerDecorator("AnswerFreeSketch")
export default class AnswerFreeSketch extends Model<
    AnswerFreeSketchAttributes,
    AnswerFreeSketchCreationAttributes
> {
    notationType: NotationType = "FREESKETCH";
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
    @Column({ type: DataType.JSON })
    points!: { x: number; y: number }[];

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;
}