import { Model, Column, BelongsTo, ForeignKey, DataType, AllowNull } from "sequelize-typescript";
import {
    QuestionRectAttributes,
    QuestionRectCreationAttributes,
} from "../../../../../math-common/src/questionTypes";
import QuestionDecorator from "../questionDecorator";
import User from "../../user.model";
import Question from "../question.model";

@QuestionDecorator("QuestionGeo")
export default class QuestionTriangle extends Model<
    QuestionRectAttributes,
    QuestionRectCreationAttributes
> {
    notationType = "TEXT";
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
    @Column({ type: DataType.INTEGER })
    alfa!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    beta!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    gamma!: number;
}
