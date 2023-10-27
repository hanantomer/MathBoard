import  User  from "../user.model";
import Lesson from "./lesson.model";
import {
    Table,
    DefaultScope,
    Model,
    BelongsTo,
    ForeignKey,
} from "sequelize-typescript";


import {
    StudentLessonAttributes,
    StudentLessonCreationAttributes,
} from "../../../../math-common/src/userTypes";



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
export default class StudentLesson extends Model<
    StudentLessonAttributes,
    StudentLessonCreationAttributes
> {
    @ForeignKey(() => User)
    userId!: number;

    @BelongsTo(() => User, {
        foreignKey: {
            allowNull: false,
        },
    })
    user!: User;

    @ForeignKey(() => Lesson)
    lessonId!: number;

    @BelongsTo(() => Lesson, {
        foreignKey: {
            allowNull: false,
        },
    })
    lesson!: Lesson;
};

