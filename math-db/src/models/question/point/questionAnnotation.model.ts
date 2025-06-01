import QuestionDecorator from "../../question/questionDecorator";
import { Model, Column, BelongsTo, ForeignKey, DataType, AllowNull } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/unions";
import User from "../../user.model";
import Color from "../../color.model";
import Question from "../../question/question.model";
import {
    QuestionPointAttributes,
    QuestionPointCreationAttributes,
} from "../../../../../math-common/src/questionTypes";

        
@QuestionDecorator("QuestionAnnotation")
export default class QuestionAnnotation extends Model<
    QuestionPointAttributes,
    QuestionPointCreationAttributes
> {
    notationType: NotationType = "ANNOTATION";
    boardType: BoardType = "LESSON";

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
}
