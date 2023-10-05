//snyk.io/advisor/npm-package/sequelize-typescript/functions/sequelize-typescript.Scopes

import User from "./user.model";
import { Table, DefaultScope } from "sequelize-typescript";

export default function BoardDecorator(tableName: string) {
    return function (target: Function): void {
        DefaultScope(() => ({
            attributes: {
                exclude: ["id"],
           },
        }))(target);
        Table({
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
