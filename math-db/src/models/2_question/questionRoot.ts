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
    tableName: "questionRoot",
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ["QuestionId", "fromCol", "toCol", "row"],
        },
    ],
})
@DefaultScope(() => ({
    attributes: {
        exclude: ["QuestionId"],
    },
}))
export class QuestionRoot extends Model {
    @BelongsTo(() => Question)
    question: Question;
    
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
    row!: number;
};