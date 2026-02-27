import {
    ForeignKey,
    Model,
    Column,
    DataType,
    BelongsTo,
    AllowNull,
} from "sequelize-typescript";
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
    @ForeignKey(() => User)
    userId!: number;

    @BelongsTo(() => User, {
        foreignKey: {
            allowNull: false,
        },
    })
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
