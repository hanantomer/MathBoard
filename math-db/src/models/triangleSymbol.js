"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class TriangleSymbol extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {}
    }
    TriangleSymbol.init(
        {
            ab: { type: DataTypes.INTEGER },
            bc: { type: DataTypes.INTEGER },
            ca: { type: DataTypes.INTEGER },
            abc: { type: DataTypes.INTEGER },
            bca: { type: DataTypes.INTEGER },
            cab: { type: DataTypes.INTEGER },
        },
        { sequelize, freezeTableName: true }
    );
    return TriangleSymbol;
};
