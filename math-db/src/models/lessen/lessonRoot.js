"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class LessonRoot extends Model {
        static associate(models) {
            LessonRoot.belongsTo(models.Lesson, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
            LessonRoot.belongsTo(models.User, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
        }
    }

    LessonRoot.init(
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
                    fields: ["row", "fromCol"],
                },
            ],
        }
    );

    return LessonRoot;
};
