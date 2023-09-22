import { Model } from "sequelize-typescript";
import { UesrType } from "../../../math-common/build/enum";
import { UserAttributes, UserCreationAttributes } from "../../../math-common/build/userTypes";
export default class User extends Model<UserAttributes, UserCreationAttributes> {
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
