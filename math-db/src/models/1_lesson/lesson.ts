import { User } from "../user";

import {
    Table,
    DefaultScope,
    Model,
    Column,
    DataType,
    BelongsTo,
} from "sequelize-typescript";

@Table({
    timestamps: true,
    tableName: "lesson",
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ["uuid"],
        },
    ],
})
@DefaultScope(() => ({
    attributes: {
        exclude: ["id"],
    },
}))
export class Lesson extends Model {
    @BelongsTo(() => User)
    user: User;

    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    uuid!: string;

    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    name!: string;
};
