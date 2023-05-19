import { Model } from "sequelize-typescript";
import User from "../user.model";
export default class Lesson extends Model {
    userId: number;
    user: User;
    uuid: string;
    name: string;
}
