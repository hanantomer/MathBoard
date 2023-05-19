import { Table, DefaultScope } from "sequelize-typescript";
import BoardDecorator from "../boardDecorator";


export default function LessonDecorator(tableName: string) {
    return function (target: Function): void {
        BoardDecorator(tableName)(target);
        DefaultScope(() => ({
            attributes: {
                exclude: ["LessonId"],
            },
        }))(target);
        Table({
            indexes: [
                {
                    fields: ["LessonId"],
                },
            ],
        })(target);
   }
}
