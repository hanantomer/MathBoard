import { Model, Column, DataType, BelongsTo, ForeignKey } from "sequelize-typescript";
import { Optional } from "sequelize";
import BoardDecorator from "../boardDecorator";
import { User } from "../user.model";

export interface LessonAttributes {
    id: number;
    user: User;
    uuid: string;
    name: string;
}

export interface LessonCreateAttributes
    extends Optional<LessonAttributes, "id"> {}


@BoardDecorator("lesson")
export default class Lesson extends Model<
    LessonAttributes,
    LessonCreateAttributes> {

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
