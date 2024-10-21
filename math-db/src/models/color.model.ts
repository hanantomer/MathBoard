import {
    Table,
    DefaultScope,
    Model,
    Column,
    DataType,
    AllowNull
} from "sequelize-typescript";


@Table({
    timestamps: true,
    tableName: "color",
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ["id"],
        },
    ],
})
export default class Color extends Model<number> {

    @AllowNull(false)
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    color!: string;
}