"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Fraction extends Model {
        static associate(models) {
            Fraction.belongsTo(models.Exercise, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
            Fraction.belongsTo(models.User, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
        }
    }

    Fraction.init(
        {
            col: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            row: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            nominatorValue: {
                type: DataTypes.STRING,
            },
            denominatorValue: {
                type: DataTypes.STRING,
            },
        },
        {
            sequelize,
            freezeTableName: true,
            indexes: [
                {
                    unique: true,
                    fields: ["row", "col"],
                },
            ],
        }
    );

    return Fraction;
};
