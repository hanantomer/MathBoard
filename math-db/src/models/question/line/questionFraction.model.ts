import { Model, Column, BelongsTo, ForeignKey, DataType } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/build/enum";
import {
    QuestionLineAttributes,
    QuestionLineCreationAttributes,
} from "../../../../../math-common/build/notationTypes";
import User from "../../user.model";
import Question from "../../question/question.model";
import QuestionDecorator from "../../question/questionDecorator";

@QuestionDecorator("LessonFraction")
export default class QuestionFraction extends Model<
    QuestionLineAttributes,
    QuestionLineCreationAttributes
> {
    notationType = NotationType.FRACTION;
    boardType = BoardType.QUESTION;
    value = null;

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
    row!: number;
}
