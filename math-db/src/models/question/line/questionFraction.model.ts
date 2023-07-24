import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/enum";
import { UUID, UUIDV4 } from "sequelize/types/data-types";
import { QuestionLineAttributes, QuestionLineCreationAttributes } from "@/models/question/line/questionLineAttributes";
import User from "@/models/user.model";
import Question from "@/models/question/question.model";
import QuestionDecorator from "@/models/question/questionDecorator";

@QuestionDecorator("LessonFraction")
export default class QuestionFraction extends Model<
    QuestionLineAttributes,
    QuestionLineCreationAttributes
> {
    notationType = NotationType.FRACTION;
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
