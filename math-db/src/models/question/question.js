"use strict";
const { Model, INTEGER } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Question extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Question.belongsTo(models.Lesson, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
        }
    }

    Question.init(
        {
            index: {
                type: DataTypes.INTEGER,
                field: "index",
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                field: "name",
                allowNull: false,
            },
        },
        {
            sequelize,
            freezeTableName: true,
            indexes: [
                {
                    unique: false,
                    fields: ["lessonId"],
                },
            ],
        }
    );

    return Question;
};
