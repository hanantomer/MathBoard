import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/enum";
import { UUID, UUIDV4 } from "sequelize/types/data-types";
import QuestionDecorator from "../questionDecorator";
import User from "../../user.model";
import Question from "../question.model";
import { QuestionPointAttributes, QuestionPointCreationAttributes } from "@/models/question/point/questionPointAttributes";

@QuestionDecorator("QuestionSign")
export default class QuestionSign extends Model<
    QuestionPointAttributes,
    QuestionPointCreationAttributes
> {
    notationType = NotationType.SIGN;
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
