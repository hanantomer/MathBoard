"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class QuestionSymbol extends Model {
        static associate(models) {
            QuestionSymbol.belongsTo(models.Question, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
            QuestionSymbol.belongsTo(models.User, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });             
        }
    }

    QuestionSymbol.init(
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
                    fields: ["questionId","row", "col"],
                },
            ],
            defaultScope: {
                exclude: ["QuestionId"]
            },
        }
    );

    return QuestionSymbol;
};
