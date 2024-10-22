import {
    Table,
    DefaultScope,
    Model,
    Column,
    DataType,
    AllowNull
} from "sequelize-typescript";
import { ColorAttributes, ColorCreationAttributes } from "../../../math-common/src/baseTypes";


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
export default class Color extends Model<ColorAttributes, ColorCreationAttributes > {

    @AllowNull(false)
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    value!: string;
}