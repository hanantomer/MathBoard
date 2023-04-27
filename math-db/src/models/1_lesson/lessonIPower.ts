import { User } from "../user";
import { Lesson } from "../1_lesson/lesson";
import {
    Table,
    DefaultScope,
    Model,
    Column,
    DataType,
    BelongsTo,
} from "sequelize-typescript";

@Table({
    timestamps: true,
    tableName: "lessonPower",
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ["LessonId", "col", "row"],
        },
    ],
})
@DefaultScope(() => ({
    attributes: {
        exclude: ["LessonId"],
    },
}))
export class LessonPower extends Model {
    @BelongsTo(() => Lesson)
    lesson: Lesson;

    @BelongsTo(() => User)
    user: User;

    @Column({
        type: DataType.INTEGER,
    })
    col!: number;

    @Column({
        type: DataType.INTEGER,
    })
    row!: number;

    @Column({
        type: DataType.STRING,
    })
    value!: string;
};

