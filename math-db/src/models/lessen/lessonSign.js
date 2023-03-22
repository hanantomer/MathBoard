"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class LessonSign extends Model {
        static associate(models) {
            LessonSign.belongsTo(models.Lesson, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
            LessonSign.belongsTo(models.User, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
        }
    }

    LessonSign.init(
        {
            col: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            row: {
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
                    unique: true,
                    fields: ["lessonId", "row", "col"],
                },
            ],
            defaultScope: {
                exclude: ["LessonId"]
            },
        }
    );

    return LessonSign;
};
