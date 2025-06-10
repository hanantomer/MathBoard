import { Model, Column, BelongsTo, ForeignKey, DataType, AllowNull } from "sequelize-typescript";
import QuestionDecorator from "../../question/questionDecorator";
import User from "../../user.model";
import Color from "../../color.model";
import Question from "../../question/question.model";
import { QuestionPointAttributes, QuestionPointCreationAttributes } from "../../../../../math-common/src/questionTypes";

@QuestionDecorator("QuestionLogBase")
export default class QuestionLogBase extends Model<
    QuestionPointAttributes,
    QuestionPointCreationAttributes
> {
    notationType = "LOGBASE";
    boardType = "QUESTION";

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
    col!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    row!: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
    value!: string;

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;
}