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
    tableName: "answerImage",
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ["AnswerId", "fromRow", "fromCol"],
        },
    ],
})
@DefaultScope(() => ({
    attributes: {
        exclude: ["AnswerId"],
    },
}))
export class AnswerImage extends Model {
    @BelongsTo(() => Answer)
    answer: Answer;
    
    @BelongsTo(() => User)
    user: User;

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
    fromRow!: number;

    @Column({
        type: DataType.INTEGER,
    })
    toRow!: number;

    @Column({
        type: DataType.STRING,
    })
    value!: string;
};

