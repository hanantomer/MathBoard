"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class NumberSymbol extends Model {
        static associate(models) {
            NumberSymbol.belongsTo(models.Symbol, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
        }
    }
    NumberSymbol.init(
        {
            value: {
                type: DataTypes.STRING,
            },
        },
        { sequelize, freezeTableName: true }
    );
    return NumberSymbol;
};
