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
    tableName: "lessonSymbol",
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ["LessonId", "row", "col"],
        },
    ],
})
@DefaultScope(() => ({
    attributes: {
        exclude: ["LessonId"],
    },
}))
export class LessonSymbol extends Model {
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

