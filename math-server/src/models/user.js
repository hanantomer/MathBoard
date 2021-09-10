'use strict';
const bcryptjs = require("bcryptjs");
const { errorMonitor } = require("events");
const jwt = require('jsonwebtoken');
const env = process.env.NODE_ENV || 'development';
const config = require('../../server/config/config.json')[env];


const {
  Model
} = require('sequelize');

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
      })
    }
  };
  User.init({
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
      isEmail: true
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

    
  }, { sequelize, freezeTableName: true });

  // ??? TODO - is this needed
  User.beforeFind(async (user, options) => {
      console.debug("before find");
      if (!!user.where.password) {
        delete user.where.password;
      }
    }
  );

  User.beforeCreate(async (user, options) => {
    if (user.password) {
      user.password = await bcryptjs.hash(user.password, 8);
    }
  });

  return User;
};