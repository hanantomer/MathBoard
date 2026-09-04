import {
    Model, Column, BelongsTo, ForeignKey, DataType, AllowNull
} from "sequelize-typescript";
import User from "../../user.model";
import Color from "../../color.model";
import Question from "../question.model";
import QuestionDecorator from "../questionDecorator";
import {
    QuestionConicAttributes,
    QuestionConicCreationAttributes,
} from "../../../../../math-common/build/questionTypes";
import { BoardType, NotationType } from "../../../../../math-common/build/unions";

@QuestionDecorator("QuestionConic")
export default class QuestionConic extends Model<
    QuestionConicAttributes,
    QuestionConicCreationAttributes
> {
    notationType: NotationType = "CONIC";
    boardType: BoardType = "QUESTION";

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
    @Column({ type: DataType.STRING })
    kind!: string;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    hx!: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    hy!: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
    axis!: string;

    @AllowNull(false)
    @Column({ type: DataType.FLOAT })
    a!: number;

    @AllowNull(true)
    @Column({ type: DataType.FLOAT })
    b?: number;

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;
}
