import {
    Table,
    DefaultScope,
    Model,
    Column,
    DataType,
    AllowNull,
    HasMany
} from "sequelize-typescript";

import { UserType } from "../../../math-common/build/unions";
import {
    UserAttributes,
    UserCreationAttributes,
} from "../../../math-common/build/userTypes";
import Answer from "./answer/answer.model";


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
        {
            unique: true,
            fields: ["email"],
        },
    ],
})
export default class User extends Model<
    UserAttributes,
    UserCreationAttributes
> {
    @AllowNull(false)
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    uuid!: string;

    @AllowNull(false)
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    firstName!: string;

    @AllowNull(false)
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    lastName!: string;

    @AllowNull(false)
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

    @AllowNull(false)
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
    reset_pasword_token!: string|null;

    @AllowNull(false)
    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    userType!: UserType;

    @HasMany(() => Answer, {
        foreignKey: "answerId",
    })
    answers!: Answer[];

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    approved!: boolean;
}