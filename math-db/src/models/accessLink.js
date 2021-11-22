"use strict";
const { Model, INTEGER } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class AccessLink extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            AccessLink.belongsTo(models.Exercise, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
        }
    }

    AccessLink.init(
        {
            link: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        { sequelize, freezeTableName: true }
    );

    return AccessLink;
};
