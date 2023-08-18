import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/enum";
import { UUID, UUIDV4 } from "sequelize/types/data-types";
import { User } from "../../user.model";
import Question from "../question.model";
import QuestionDecorator from "../questionDecorator";
import { QuestionLineAttributes,QuestionLineCreationAttributes } from "@/models/question/line/questionLineAttributes";

@QuestionDecorator("QuestionSqrt")
export default class QuestionSqrt extends Model<
    QuestionLineAttributes,
    QuestionLineCreationAttributes
> {
    notationType = NotationType.SQRT;
    boardType = BoardType.QUESTION;
    value = null;

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
    fromCol!: number;

    @Column
    toCol!: number;

    @Column
    row!: number;
}
