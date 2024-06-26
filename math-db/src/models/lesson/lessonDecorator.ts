import { Table, DefaultScope, Validate } from "sequelize-typescript";
import BoardDecorator from "../boardDecorator";


export default function LessonDecorator(tableName: string) {
    return function (target: Function): void {
        BoardDecorator(tableName)(target);
        DefaultScope(() => ({
            attributes: {
                exclude: ["lessonId", "userId", "id", "createdAt", "updatedAt"],
            },
        }))(target);
        Table({
            indexes: [
                {
                    fields: ["lessonId"],
                },
            ],
        })(target);
   }
}
