//const { Model, INTEGER } = require("sequelize");

import { DataTypes } from "sequelize";
import { Lesson } from "../1_lesson/lesson";
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
    tableName: "question",
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
export class Question extends Model {
    
    @BelongsTo(() => Lesson)
    lesson: Lesson;

    @Column({
        type: DataType.UUID,
        defaultValue: DataTypes.UUIDV4,
    })
    uuid!: string;

    @Column({
        type: DataType.UUID,
        defaultValue: DataTypes.UUIDV4,
    })
    name!: string;
};
