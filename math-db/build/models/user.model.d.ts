import { Model } from "sequelize-typescript";
import { UesrType } from "../../../math-common/src/unions";
import { UserAttributes, UserCreationAttributes } from "../../../math-common/build/userTypes";
import Answer from "./answer/answer.model";
export default class User extends Model<UserAttributes, UserCreationAttributes> {
    uuid: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
    password: string;
    access_token: string;
    userType: UesrType;
    answers: Answer[];
}
