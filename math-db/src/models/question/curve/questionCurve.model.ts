import {
    Model, Column, BelongsTo, ForeignKey, DataType, AllowNull
} from "sequelize-typescript";
import User from "../../user.model";
import Color from "../../color.model";
import Question from "../question.model";
import QuestionDecorator from "../questionDecorator";
import {
    QuestionCurveAttributes,
    QuestionCurveCreationAttributes,
} from "../../../../../math-common/src/questionTypes";
import { BoardType, NotationType } from "../../../../../math-common/src/unions";

@QuestionDecorator("QuestionCurve")
export default class QuestionCurve extends Model<
    QuestionCurveAttributes,
    QuestionCurveCreationAttributes
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

    @ForeignKey(() => Question)
    questionId!: number;

    @BelongsTo(() => Question, {
        foreignKey: {
            allowNull: false,
        },
    })
    question!: Question;

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
