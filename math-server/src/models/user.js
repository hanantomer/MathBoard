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

  // authenticate user either by password or token
  User.beforeFind(async (user, options) => {
    console.debug("before find");
    //if (!user.where.password && !user.where.token) {
    //  throw new Error("find user must supply either password or token");
    //}
    if (!!user.where.password) {
      delete user.where.password;//await bcryptjs.hash(user.where.password, 8);
    }
    
    // if (user.token) {
    //  
    }
  );

  User.afterFind(async (user, options) => {
    //user.password = null;
  });

  User.beforeCreate(async (user, options) => {
    if (user.password) {
      user.password = await bcryptjs.hash(user.password, 8);
      user.token =
        jwt.sign({ email: user.email }, config.client_secret, {expiresIn: 86400*30 });
    }
  });

  return User;
};