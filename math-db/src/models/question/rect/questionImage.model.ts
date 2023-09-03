import { Model, Column, BelongsTo, ForeignKey, DataType } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/build/enum";
import QuestionDecorator from "../../question/questionDecorator";
import User from "../../user.model";
import Question from "../../question/question.model";
import {
    QuestionRectAttributes,
    QuestionRectCreationAttributes,
} from "../../../../../math-common/build/notationTypes";

@QuestionDecorator("QuestionImage")
export default class QuestionImage extends Model<
    QuestionRectAttributes,
    QuestionRectCreationAttributes
> {
    notationType = NotationType.IMAGE;
    boardType = BoardType.QUESTION;
    selected = false;

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
