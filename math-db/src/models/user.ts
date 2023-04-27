//@ForeignKey(() => User) @Column userId!: number;
// @BelongsTo(() => User) user: User;

import { Table, DefaultScope, Model, Column, DataType } from "sequelize-typescript";

@Table({
    timestamps: true,
    tableName: "user",
})
@DefaultScope(() => ({
    attributes: {
        exclude: ["password"]
    }
}))
export class User extends Model {
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