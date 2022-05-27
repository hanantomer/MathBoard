"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class ExerciseRoot extends Model {
        static associate(models) {
            ExerciseRoot.belongsTo(models.Exercise, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
            ExerciseRoot.belongsTo(models.User, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
        }
    }

    ExerciseRoot.init(
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
                    fields: ["row", "fromCol"],
                },
            ],
        }
    );

    return ExerciseRoot;
};
