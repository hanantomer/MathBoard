import { Table, DefaultScope } from "sequelize-typescript";
import BoardDecorator from "../boardDecorator";

export default function QuestionDecorator(tableName: string) {
    return function (target: Function): void {
        BoardDecorator(tableName)(target);
        DefaultScope(() => ({
            attributes: {
                exclude: ["QuestionId"],
            },
        }))(target);
        Table({
            indexes: [
                {
                    fields: ["QuestionId"],
                },
            ],
        })(target);
   }
}
