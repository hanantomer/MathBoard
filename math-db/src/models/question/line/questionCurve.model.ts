import {
    Model, Column, BelongsTo, ForeignKey, DataType, AllowNull
} from "sequelize-typescript";
import  User from "../../user.model";
import Question from "../../question/question.model";
import QuestionDecorator from "../../question/questionDecorator";
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
    fromCol!: number; // col related to the lower row

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    toCol!: number; // col related to the higher row

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    fromRow!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    toRow!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    controlPoint1Col!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    controlPoint1Row!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    controlPoint2Col!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    controlPoint2Row!: number;
}
