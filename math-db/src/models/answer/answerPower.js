"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class AnswerPower extends Model {
        static associate(models) {
            AnswerPower.belongsTo(models.Answer, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
            AnswerPower.belongsTo(models.User, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            }); 
        }
    }

    AnswerPower.init(
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
                    fields: ["AnswerId","row","col","userId"],
                },
            ],
            defaultScope: {
                exclude: ["AnswerId"]
            },
        }
    );

    return AnswerPower;
};
