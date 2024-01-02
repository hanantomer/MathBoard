//snyk.io/advisor/npm-package/sequelize-typescript/functions/sequelize-typescript.Scopes

import { Table, DefaultScope } from "sequelize-typescript";

export default function BoardDecorator(tableName: string) {

    const indexes = [
        {
            unique: true,
            fields: ["uuid"],
        },
    ];

    if (tableName == 'answer') {
        indexes.push({unique: true, fields:['userId','questionId']})
    }

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
            indexes
        })(target);
    };
}
