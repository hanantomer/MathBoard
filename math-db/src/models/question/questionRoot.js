"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class QuestionRoot extends Model {
        static associate(models) {
            QuestionRoot.belongsTo(models.Question, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
        }
    }
    QuestionRoot.init(
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
                    fields: ["QuestionId", "row", "fromCol"],
                },
            ],
        }
    );

    return QuestionRoot;
};
