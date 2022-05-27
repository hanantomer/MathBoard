"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class ExerciseSymbol extends Model {
        static associate(models) {
            ExerciseSymbol.belongsTo(models.Exercise, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
            ExerciseSymbol.belongsTo(models.User, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
        }
    }

    ExerciseSymbol.init(
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
                    unique: false,
                    fields: ["exerciseId", "symbolId"],
                },
            ],
        }
    );

    return ExerciseSymbol;
};
