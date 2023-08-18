import { Model, Column, DataType, BelongsTo, ForeignKey } from "sequelize-typescript";
import BoardDecorator from "../boardDecorator";
import {User, UserAttributes }  from "../user.model";
import Question, { QuestionAttributes }  from "../question/question.model";
import { Optional } from "sequelize";

export interface AnswerAttributes {
    id: number;
    userId: number;
    uuid: string;
    user: UserAttributes;
    name: string;
    questionId: number;
    question: QuestionAttributes;
    createdAt: Date;
}

export interface AnswerCreateAttributes extends Optional<AnswerAttributes, "id"> {}
@BoardDecorator("answer")
export default class Answer extends Model<
    AnswerAttributes,
    AnswerCreateAttributes
> {
    @ForeignKey(() => User)
    userId!: number;

    @BelongsTo(() => User)
    user!: User;

    @ForeignKey(() => Question)
    questionId!: number;

    @BelongsTo(() => Question)
    question!: Question;

    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    uuid!: string;

    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    name!: string;
}
