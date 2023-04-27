import { User } from "../user";
import { Lesson } from "../1_lesson/lesson";
import {
    Table,
    DefaultScope,
    Model,
    BelongsTo,
} from "sequelize-typescript";

@Table({
    timestamps: true,
    tableName: "studentLesson",
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ["LessonId", "UserId"],
        },
    ],
})
@DefaultScope(() => ({
    attributes: {
        exclude: ["LessonId"],
    },
}))
export class StudentLesson extends Model {
    @BelongsTo(() => Lesson)
    lesson: Lesson;
    
    @BelongsTo(() => User)
    user: User;
};

