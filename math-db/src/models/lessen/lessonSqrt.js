"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class LessonSqrt extends Model {
        static associate(models) {
            LessonSqrt.belongsTo(models.Lesson, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
            LessonSqrt.belongsTo(models.User, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
        }
    }

    LessonSqrt.init(
        {
            fromCol: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            toCol: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            row: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize,
            freezeTableName: true,
            indexes: [
                {
                    unique: true,
                    fields: ["lessonId", "row", "fromCol"],
                },
            ],
        }
    );

    return LessonSqrt;
};
