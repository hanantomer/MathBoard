import { Table, DefaultScope } from "sequelize-typescript";
import BoardDecorator from "../boardDecorator";

export default function QuestionDecorator(tableName: string) {
    return function (target: Function): void {
        BoardDecorator(tableName)(target);
        DefaultScope(() => ({
            attributes: {
                exclude: ["questionId"],
            },
        }))(target);
        Table({
            indexes: [
                {
                    fields: ["questionId"],
                },
            ],
        })(target);
   }
}
