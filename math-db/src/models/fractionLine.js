"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class FractionLine extends Model {
        static associate(models) {
            FractionLine.belongsTo(models.Exercise, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
            FractionLine.belongsTo(models.User, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
        }
    }

    FractionLine.init(
        {
            colLeft: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            colRight: {
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
                    fields: ["row", "colLeft"],
                },
            ],
        }
    );

    return FractionLine;
};
