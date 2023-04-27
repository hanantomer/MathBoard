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
    tableName: "answerSign",
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ["AnswerId", "row", "col"],
        },
    ],
})
@DefaultScope(() => ({
    attributes: {
        exclude: ["AnswerId"],
    },
}))
export class AnswerSign extends Model {
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

