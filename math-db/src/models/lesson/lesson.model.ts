import { Model, Column, DataType, BelongsTo, ForeignKey, AllowNull } from "sequelize-typescript";
import BoardDecorator from "../boardDecorator";
import  User  from "../user.model";
import {
    LessonAttributes,
    LessonCreationAttributes,
} from "../../../../math-common/build/lessonTypes";



@BoardDecorator("lesson")
export default class Lesson extends Model<
    LessonAttributes,
    LessonCreationAttributes
> {
    @BelongsTo(() => User, "userId")
    user!: User;

    @AllowNull(false)
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    uuid!: string;

    @AllowNull(false)
    @Column({
        type: DataType.STRING,
    })
    name!: string;
}
