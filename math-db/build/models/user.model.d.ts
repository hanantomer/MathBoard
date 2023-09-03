import { Model } from "sequelize-typescript";
import { UesrType } from "../../../math-common/build/enum";
import { UserAttributes, UserCreateAttributes } from "../../../math-common/build/notationTypes";
export default class User extends Model<UserAttributes, UserCreateAttributes> {
    authorized: boolean;
    lastHeartbeatTime: Date;
    uuid: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
    password: string;
    access_token: string;
    userType: UesrType;
}
