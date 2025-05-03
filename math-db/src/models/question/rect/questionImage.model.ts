import { Model, Column, BelongsTo, ForeignKey, DataType, AllowNull } from "sequelize-typescript";
import QuestionDecorator from "../../question/questionDecorator";
import User from "../../user.model";
import Color from "../../color.model";
import Question from "../../question/question.model";
import {
    QuestionRectAttributes,
    QuestionRectCreationAttributes,
} from "../../../../../math-common/src/questionTypes";

@QuestionDecorator("QuestionImage")
export default class QuestionImage extends Model<
    QuestionRectAttributes,
    QuestionRectCreationAttributes
> {
    notationType = "IMAGE";
    boardType = "QUESTION";
    selected = false;

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
    @Column({ type: DataType.TEXT })
    value!: string;

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;
}
