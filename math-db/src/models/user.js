"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            User.hasMany(models.Exercise, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            });
        }
    }
    User.init(
        {
            name: {
                type: DataTypes.STRING,
            },
            lastName: {
                type: DataTypes.STRING,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                isEmail: true,
            },
            imageUrl: {
                type: DataTypes.STRING,
            },
            password: {
                type: DataTypes.STRING,
            },
            token: {
                type: DataTypes.STRING,
            },
        },
        { sequelize, freezeTableName: true }
    );

    return User;
};
