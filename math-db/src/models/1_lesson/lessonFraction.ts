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
    tableName: "lessonFraction",
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ["LessonId", "row", "fromCol"],
        },
    ],
})
@DefaultScope(() => ({
    attributes: {
        exclude: ["LessonId"],
    },
}))
export class LessonFraction extends Model {
    @BelongsTo(() => Lesson)
    lesson: Lesson;
    
    @BelongsTo(() => User)
    user: User;

    @Column({
        type: DataType.INTEGER,
    })
    fromCol!: number;

    @Column({
        type: DataType.INTEGER,
    })
    toCol!: number;

    @Column({
        type: DataType.INTEGER,
    })
    row!: number;
};

