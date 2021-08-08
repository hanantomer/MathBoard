'use strict';
const {
  Model, INTEGER
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Exercise extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Exercise.belongsTo(models.User, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        foreignKey: { allowNull: false }
      })
    }
  };
  
  Exercise.init({
    name: {
      type: DataTypes.STRING,
      field: 'name'
    }
  }, { sequelize, freezeTableName: true });
  
  return Exercise;
};