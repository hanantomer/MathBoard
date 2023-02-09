"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class AnswerFraction extends Model {
        static associate(models) {
            AnswerFraction.belongsTo(models.Answer, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
            AnswerFraction.belongsTo(models.User, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });

        }
    }

    AnswerFraction.init(
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
                    fields: ["AnswerId", "row", "fromCol","userId"],
                },
            ],
        }
    );

    return AnswerFraction;
};
