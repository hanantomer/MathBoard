import { Model, Column, BelongsTo, ForeignKey } from "sequelize-typescript";
import QuestionDecorator from "../questionDecorator";
import User from "../../user.model";
import Question from "../question.model";

@QuestionDecorator("QuestionSign")
export default class QuestionSign extends Model {
    
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