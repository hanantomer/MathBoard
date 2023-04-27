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
    tableName: "answerSymbol",
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ["AanswerId", "row", "col"],
        },
    ],
})
@DefaultScope(() => ({
    attributes: {
        exclude: ["AanswerId"],
    },
}))
export class AanswerSymbol extends Model {
    @BelongsTo(() => Answer) Aanswer: Answer;
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

