import { User } from "../user.model";
import Lesson  from "./lesson.model";
import {
    Table,
    DefaultScope,
    Model,
    BelongsTo,
    ForeignKey,
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
export default class StudentLesson extends Model {
    @ForeignKey(() => User)
    userId!: number;

    @BelongsTo(() => User)
    user!: User;

    @ForeignKey(() => Lesson)
    lessonId!: number;

    @BelongsTo(() => Lesson)
    lesson!: Lesson;
};

