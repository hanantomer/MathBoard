import {
    Model, Column, BelongsTo, ForeignKey, DataType, AllowNull
} from "sequelize-typescript";
import  User from "../../user.model";
import Question from "../../question/question.model";
import QuestionDecorator from "../../question/questionDecorator";
import {
    QuestionSlopeLineAttributes,
    QuestionSlopeLineCreationAttributes,
} from "../../../../../math-common/src/questionTypes";

@QuestionDecorator("QuestionSlopeLine")
export default class QuestionSlopeLine extends Model<
    QuestionSlopeLineAttributes,
    QuestionSlopeLineCreationAttributes
> {
    notationType = "SlopeLINE";
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
}
