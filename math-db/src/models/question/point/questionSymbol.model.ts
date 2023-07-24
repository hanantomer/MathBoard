import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/enum";
import { UUID, UUIDV4 } from "sequelize/types/data-types";
import QuestionDecorator from "@/models/question/questionDecorator";
import User from "@/models/user.model";
import Question from "@/models/question/question.model";
import { QuestionPointAttributes, QuestionPointCreationAttributes } from "@/models/question/point/questionPointAttributes";


@QuestionDecorator("QuestionSymbol")
export default class QuestionSymbol extends Model<
    QuestionPointAttributes,
    QuestionPointCreationAttributes
> {
    notationType = NotationType.SYMBOL;
    boardType = BoardType.QUESTION;

    @Column({ type: UUID, defaultValue: UUIDV4 })
    uuid!: string;

    @ForeignKey(() => User)
    userId!: number;

    @BelongsTo(() => User)
    user!: User;

    @ForeignKey(() => Question)
    questionId!: number;

    @BelongsTo(() => Question)
    question!: Question;

    @Column
    col!: number;

    @Column
    row!: number;

    @Column
    value!: string;
}
