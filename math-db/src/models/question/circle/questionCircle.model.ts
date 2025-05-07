import {
    Model, Column, BelongsTo, ForeignKey, DataType, AllowNull
} from "sequelize-typescript";
import User from "../../user.model";
import Color from "../../color.model";
import Question from "../question.model";
import QuestionDecorator from "../questionDecorator";
import {
    QuestionCircleAttributes,
    QuestionCircleCreationAttributes,
} from "../../../../../math-common/build/questionTypes";
import { BoardType, NotationType } from "../../../../../math-common/build/unions";

@QuestionDecorator("QuestionCircle")
export default class QuestionCircle extends Model<
    QuestionCircleAttributes,
    QuestionCircleCreationAttributes
> {
    notationType: NotationType = "CIRCLE";
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
    cx!: number;  

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    cy!: number; 

    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    r!: number;

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;
}
