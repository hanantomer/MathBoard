"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class LessonFraction extends Model {
        static associate(models) {
            LessonFraction.belongsTo(models.Lesson, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
            LessonFraction.belongsTo(models.User, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
        }
    }

    LessonFraction.init(
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

    return LessonFraction;
};
