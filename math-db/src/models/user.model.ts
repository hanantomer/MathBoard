import {
    Table,
    DefaultScope,
    Model,
    Column,
    DataType,
    AllowNull,
    HasMany
} from "sequelize-typescript";

import { UesrType } from "../../../math-common/src/unions";
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

    @AllowNull(false)
    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    userType!: UesrType;

    @HasMany(() => Answer, {
        foreignKey: "answerId",
    })
    answers!: Answer[];
}