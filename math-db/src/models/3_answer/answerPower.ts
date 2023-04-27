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
    tableName: "answerPower",
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ["AnswerId", "col", "row"],
        },
    ],
})
@DefaultScope(() => ({
    attributes: {
        exclude: ["AnswerId"],
    },
}))
export class AnswerPower extends Model {
    @BelongsTo(() => Answer) answer: Answer;
    @BelongsTo(() => User) user: User;

    @Column({
        type: DataType.INTEGER,
    })
    col!: number;

    @Column({
        type: DataType.INTEGER,
    })
    row!: number;

    @Column({
        type: DataType.STRING,
    })
    value!: string;
};

