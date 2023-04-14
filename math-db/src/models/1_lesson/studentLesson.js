// lessons sheared with students via access link
"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class StudentLesson extends Model {
        static associate(models) {
            StudentLesson.belongsTo(models.Lesson, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
            StudentLesson.belongsTo(models.User, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
        }
    }

    StudentLesson.init(
        {},
        {
            sequelize,
            freezeTableName: true,
            indexes: [
                {
                    unique: true,
                    fields: ["LessonId", "userId"],
                },
            ],
            defaultScope: {
                include: [
                    { model: sequelize.models["User"] },
                    { model: sequelize.models["Lesson"], exclude:["id"] }],
            },
        }
    );

    return StudentLesson;
};
