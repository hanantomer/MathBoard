import {
    Model, Column, BelongsTo, ForeignKey, DataType, AllowNull
} from "sequelize-typescript";
import User from "../../user.model";
import Color from "../../color.model";
import Question from "../../question/question.model";
import QuestionDecorator from "../../question/questionDecorator";
import {
    QuestionHorizontalLineAttributes,
    QuestionHorizontalLineCreationAttributes,
} from "../../../../../math-common/src/questionTypes";

@QuestionDecorator("QuestionHorizontalLine")
export default class QuestionHorizontalLine extends Model<
    QuestionHorizontalLineAttributes,
    QuestionHorizontalLineCreationAttributes
> {
    notationType = "HORIZONTALLINE";
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
    py!: number;

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;
}
