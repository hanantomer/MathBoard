import { Model, Column, DataType, BelongsTo, ForeignKey } from "sequelize-typescript";
import BoardDecorator from "../boardDecorator";
import User from "../user.model";

@BoardDecorator("lesson")
export default class Lesson extends Model {

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
