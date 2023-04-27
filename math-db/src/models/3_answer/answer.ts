import { Question } from "../2_question/question";
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
    tableName: "answer",
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
export class Answer extends Model {
    @BelongsTo(() => Question)
    Question: Question;

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
