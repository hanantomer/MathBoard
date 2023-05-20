import { Model, Column, DataType, BelongsTo, ForeignKey } from "sequelize-typescript";
import { Optional } from "sequelize";
import BoardDecorator from "../boardDecorator";
import User from "../user.model";


export interface QuestionAttributes {
    id: number;
    userId: number;
    user: User;
    uuid: string;
    name: string;
}

interface QuestionCreationAttributes
    extends Optional<QuestionAttributes, "id"> {}

@BoardDecorator("lesson")
export default class Question extends Model<
    QuestionAttributes,
    QuestionCreationAttributes
> {
    @ForeignKey(() => User)
    userId!: number;

    @BelongsTo(() => User)
    user!: User;

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
