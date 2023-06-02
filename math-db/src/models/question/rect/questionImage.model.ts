import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/src/enum";
import { UUID, UUIDV4 } from "sequelize/types/data-types";
import QuestionDecorator from "../questionDecorator";
import User from "../../user.model";
import Question from "../question.model";

@QuestionDecorator("QuestionImage")
export default class QuestionImage extends Model {
    notationType: NotationType = NotationType.IMAGE;
    boardType: BoardType = BoardType.QUESTION;
    selected: boolean = false;

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
}
