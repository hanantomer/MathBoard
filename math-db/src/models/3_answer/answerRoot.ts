import { User } from "../user";
import { Answer } from "../3_answer/answer";
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
    tableName: "answerRoot",
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ["AnswerId", "fromCol", "toCol", "row"],
        },
    ],
})
@DefaultScope(() => ({
    attributes: {
        exclude: ["AnswerId"],
    },
}))
export class AnswerRoot extends Model {
    @BelongsTo(() => Answer) answer: Answer;
    @BelongsTo(() => User) user: User;

    @Column({
        type: DataType.INTEGER,
    })
    fromCol!: number;

    @Column({
        type: DataType.INTEGER,
    })
    toCol!: number;

    @Column({
        type: DataType.INTEGER,
    })
    row!: number;
};