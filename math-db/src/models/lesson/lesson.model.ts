import { Model, Column, DataType, BelongsTo, ForeignKey } from "sequelize-typescript";
import BoardDecorator from "../boardDecorator";
import  User  from "../user.model";
import {
    LessonAttributes,
    LessonCreateAttributes,
} from "../../../../math-common/build/notationTypes";



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
