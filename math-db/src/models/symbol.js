"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Symbol extends Model {
        static associate(models) {
            Symbol.belongsTo(models.Exercise, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
            Symbol.belongsTo(models.User, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
        }
    }

    Symbol.init(
        {
            x: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            y: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
                isIn: [["NUMBER", "SIGN", "TRIANGLE"]],
            },
        },
        { sequelize, freezeTableName: true }
    );

    return Symbol;
};
