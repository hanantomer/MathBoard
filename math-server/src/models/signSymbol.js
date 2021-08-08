'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SignSymbol extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      SignSymbol.belongsTo(models.Symbol, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        foreignKey: { allowNull: false }
      })
    }
  };
  SignSymbol.init({
    value: {
      type: DataTypes.STRING
    },
  }, { sequelize, freezeTableName: true });
  return SignSymbol;
};