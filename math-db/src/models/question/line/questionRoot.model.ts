import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import User from "../../user.model";
import Question from "../question.model";
import QuestionDecorator from "../questionDecorator";

@QuestionDecorator("QuestionRoot")
export default class QuestionRoot extends Model {
    
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
