import { Model, Column, BelongsTo, ForeignKey, DataType, AllowNull } from "sequelize-typescript";
import QuestionDecorator from "../questionDecorator";
import User from "../../user.model";
import Color from "../../color.model";
import Question from "../question.model";
import {
    QuestionExponentAttributes,
    QuestionExponentCreationAttributes,
} from "../../../../../math-common/src/questionTypes";

@QuestionDecorator("QuestionExponent")
export default class QuestionExponent extends Model<
    QuestionExponentAttributes,
    QuestionExponentCreationAttributes
> {
    notationType = "EXPONENT_STARTED";
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
