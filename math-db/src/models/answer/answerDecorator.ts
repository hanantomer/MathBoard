import { Table, DefaultScope } from "sequelize-typescript";
import BoardDecorator from "../boardDecorator";


export default function AnswerDecorator(tableName: string) {
    return function (target: Function): void {
        BoardDecorator(tableName)(target);
        DefaultScope(() => ({
            attributes: {
                exclude: ["answerId"],
            },
        }))(target);
        Table({
            indexes: [
                {
                    fields: ["answerId"],
                },
            ],
        })(target);
    };
}
