
import {
    Table,
    DefaultScope,
    Model,
    Column,
    DataType,
    
} from "sequelize-typescript";

import { Optional } from "sequelize";


export interface UserAttributes {
    id: number;
    uuid: string;
    firstName: string;
    lastName: string;
    password: string;
    access_token: string;
    imageUrl: string;
    userType: string; ///TODU use enum
    authorized: boolean;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

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
export default class User extends Model<
    UserAttributes,
    UserCreationAttributes
    > {
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