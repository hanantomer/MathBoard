"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class AnswerRoot extends Model {
        static associate(models) {
            AnswerRoot.belongsTo(models.Question, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
            AnswerRoot.belongsTo(models.User, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            }); 
        }
    }
    AnswerRoot.init(
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
                    fields: ["QuestionId", "row", "fromCol","userId"],
                },
            ],
        }
    );

    return AnswerRoot;
};
