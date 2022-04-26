"use strict";
const { Model, INTEGER } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Lesson extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Lesson.belongsTo(models.User, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
        }
    }

    Lesson.init(
        {
            name: {
                type: DataTypes.STRING,
                field: "name",
                allowNull: false,
            },
        },
        { sequelize, freezeTableName: true }
    );

    return Lesson;
};
