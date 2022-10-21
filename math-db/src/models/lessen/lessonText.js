"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class LessonText extends Model {
        static associate(models) {
            LessonText.belongsTo(models.Lesson, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
            LessonText.belongsTo(models.User, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
        }
    }

    LessonText.init(
        {
            fromCol: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            toCol: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            fromRow: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            toRow: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            value: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },

        {
            sequelize,
            freezeTableName: true,
            indexes: [
                {
                    unique: false,
                    fields: ["lessonId"],
                },
            ],
        }
    );

    return LessonText;
};
