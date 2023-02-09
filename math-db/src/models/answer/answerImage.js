"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class AnswerImage extends Model {
        static associate(models) {
            AnswerImage.belongsTo(models.Answer, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
            AnswerImage.belongsTo(models.User, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });            
        }
    }

    AnswerImage.init(
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
                    unique: true,
                    fields: ["AnswerId","fromRow","fromCol","userId"],
                },
            ],
        }
    );

    return AnswerImage;
};
