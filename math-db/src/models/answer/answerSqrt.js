"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class AnswerSqrt extends Model {
        static associate(models) {
            AnswerSqrt.belongsTo(models.Question, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
            AnswerSqrt.belongsTo(models.User, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            }); 
        }
    }

    AnswerSqrt.init(
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
                    fields: ["questionId", "row", "fromCol","userId"],
                },
            ],
        }
    );

    return AnswerSqrt;
};