import { Model } from "sequelize-typescript";
export default class User extends Model {
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
    password: string;
    access_token: string;
    userType: string;
}
