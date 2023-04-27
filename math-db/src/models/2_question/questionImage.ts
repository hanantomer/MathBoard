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
    tableName: "questionImage",
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ["QuestionId", "fromRow", "fromCol"],
        },
    ],
})
@DefaultScope(() => ({
    attributes: {
        exclude: ["QuestionId"],
    },
}))
export class QuestionImage extends Model {
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

