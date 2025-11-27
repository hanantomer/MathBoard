import {
    Model, Column, BelongsTo, ForeignKey, DataType, AllowNull
} from "sequelize-typescript";
import User from "../../user.model";
import Color from "../../color.model";
import Question from "../../question/question.model";
import QuestionDecorator from "../../question/questionDecorator";
import {
    QuestionLineAttributes,
    QuestionLineCreationAttributes,
} from "../../../../../math-common/build/questionTypes";

@QuestionDecorator("QuestionLine")
export default class QuestionLine extends Model<
    QuestionLineAttributes,
    QuestionLineCreationAttributes
> {
    notationType = "LINE";
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
    p1x!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    p2x!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    p1y!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    p2y!: number;

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;

    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    dashed!: boolean;

    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    arrowLeft!: boolean;

    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    arrowRight!: boolean;
}
