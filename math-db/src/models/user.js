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
            User.hasMany(models.Lesson, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            });
        }

    }
    User.init(
        {
            firstName: {
                type: DataTypes.STRING,
                allowNull: false,
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
            access_token: {
                type: DataTypes.STRING,
            },
            userType: { // teacher vs student
                type: DataTypes.STRING,
            }
        },
        { sequelize, freezeTableName: true }
    );

    return User;
};
