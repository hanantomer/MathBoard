import {
    Model, Column, BelongsTo, ForeignKey, DataType, AllowNull
} from "sequelize-typescript";
import User from "../../user.model";
import Color from "../../color.model";
import Question from "../question.model";
import QuestionDecorator from "../questionDecorator";
import {
    QuestionFreeSketchAttributes,
    QuestionFreeSketchCreationAttributes,
} from "../../../../../math-common/build/questionTypes";
import {
    BoardType,
    NotationType,
} from "../../../../../math-common/build/unions";

@QuestionDecorator("QuestionFreeSketch")
export default class QuestionFreeSketch extends Model<
    QuestionFreeSketchAttributes,
    QuestionFreeSketchCreationAttributes
> {
    notationType: NotationType = "FREESKETCH";
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
    @Column({ type: DataType.JSON })
    points!: { x: number; y: number }[];

    @BelongsTo(() => Color, {
        foreignKey: { name: "colorId", field: "colorId", allowNull: true },
    })
    color!: Color;
}