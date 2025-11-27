import User from "../user.model";
import Lesson from "./lesson.model";
import { Model, BelongsTo } from "sequelize-typescript";
import {
    Table,
    DefaultScope,
} from "sequelize-typescript";


import {
    StudentLessonAttributes,
    StudentLessonCreationAttributes,
} from "../../../../math-common/build/userTypes";

@Table({
    timestamps: true,
    tableName: "studentLesson",
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ["lessonId", "userId"],
        },
    ],
})
@DefaultScope(() => ({
    attributes: {
        exclude: ["lssonId, userId"],
    },
}))
export default class StudentLesson extends Model<
    StudentLessonAttributes,
    StudentLessonCreationAttributes
> {
    @BelongsTo(() => User, "userId")
    user!: User;

    @BelongsTo(() => Lesson, "lessonId")
    lesson!: Lesson;
}
