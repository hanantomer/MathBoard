"use strict";
//snyk.io/advisor/npm-package/sequelize-typescript/functions/sequelize-typescript.Scopes
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
function BoardDecorator(tableName) {
    return function (target) {
        (0, sequelize_typescript_1.DefaultScope)(() => ({
            attributes: {
                exclude: ["id"],
            },
        }))(target);
        (0, sequelize_typescript_1.Table)({
            timestamps: true,
            tableName: tableName,
            freezeTableName: true,
            indexes: [
                {
                    unique: true,
                    fields: ["uuid"],
                },
            ],
        })(target);
    };
}
exports.default = BoardDecorator;
//# sourceMappingURL=boardDecorator.js.map