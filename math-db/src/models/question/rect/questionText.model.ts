import { Model, Column, BelongsTo, ForeignKey, DataType } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/build/enum";
import {
    QuestionRectAttributes,
    QuestionRectCreationAttributes,
} from "../../../../../math-common/build/notationTypes";
import QuestionDecorator from "../questionDecorator";
import User from "../../user.model";
import Question from "../question.model";

@QuestionDecorator("QuestionText")
export default class QuestionText extends Model<
    QuestionRectAttributes,
    QuestionRectCreationAttributes
> {
    notationType = NotationType.TEXT;
    boardType = BoardType.QUESTION;

    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
    uuid!: string;

    @ForeignKey(() => User)
    userId!: number;

    @BelongsTo(() => User)
    user!: User;

    @ForeignKey(() => Question)
    questionId!: number;

    @BelongsTo(() => Question)
    question!: Question;

    @Column({ type: DataType.INTEGER })
    fromCol!: number;

    @Column({ type: DataType.INTEGER })
    toCol!: number;

    @Column({ type: DataType.INTEGER })
    fromRow!: number;

    @Column({ type: DataType.INTEGER })
    toRow!: number;

    @Column({ type: DataType.STRING })
    value!: string;
}
