import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/enum";
import { UUID, UUIDV4 } from "sequelize/types/data-types";
import QuestionDecorator from "@/models/question/questionDecorator";
import { User } from "@/models/user.model";
import Question from "@/models/question/question.model";
import { QuestionRectAttributes,QuestionRectCreationAttributes } from "@/models/question/rect/questionRectAttributes";

@QuestionDecorator("QuestionImage")
export default class QuestionImage extends Model<
    QuestionRectAttributes,
    QuestionRectCreationAttributes
> {
    notationType = NotationType.IMAGE;
    boardType = BoardType.QUESTION;
    selected = false;

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
    fromRow!: number;

    @Column
    toRow!: number;

    @Column
    value!: string;
}
