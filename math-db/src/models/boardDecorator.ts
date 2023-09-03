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
