"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class QuestionText extends Model {
        static associate(models) {
            QuestionText.belongsTo(models.Question, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
            QuestionText.belongsTo(models.User, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });             
        }
    }

    QuestionText.init(
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
            background_color: {
                type: DataTypes.STRING,
                allowNull: false,
            }
        },

        {
            sequelize,
            freezeTableName: true,
            indexes: [
                {
                    unique: true,
                    fields: ["questionId","fromRow", "fromCol"],
                },
            ],
            defaultScope: {
                exclude: ["QuestionId"]
            },
        }
    );

    return QuestionText;
};
