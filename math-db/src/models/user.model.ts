
import {
    Table,
    DefaultScope,
    Model,
    Column,
    DataType,
    
} from "sequelize-typescript";

import { UesrType } from "../../../math-common/src/enum";

export interface UserAttributes {
    id: number;
    uuid: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    access_token: string;
    imageUrl: string;
    userType: UesrType;
    authorized: boolean;
}

export interface UserCreateAttributes {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    imageUrl: string;
    userType: UesrType;
}


@DefaultScope(() => ({
    attributes: {
        exclude: ["password"],
    },
}))
@Table({
    timestamps: true,
    tableName: "user",
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ["uuid"],
        },
    ],
})
export default class User extends Model<UserAttributes, UserCreateAttributes> {
    authorized!: boolean;
    lastHeartbeatTime!: Date;

    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    uuid!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    firstName!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    lastName!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    email!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    imageUrl!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    password!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    access_token!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    userType!: string;
}