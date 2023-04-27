import { User } from "../user";
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
    tableName: "questionPower",
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ["QuestionId", "col", "row"],
        },
    ],
})
@DefaultScope(() => ({
    attributes: {
        exclude: ["QuestionId"],
    },
}))
export class QuestionPower extends Model {
    @BelongsTo(() => Question)
    question: Question;

    @BelongsTo(() => User)
    user: User;

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

