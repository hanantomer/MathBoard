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
    tableName: "questionSign",
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ["QuestionId", "row", "col"],
        },
    ],
})
@DefaultScope(() => ({
    attributes: {
        exclude: ["QuestionId"],
    },
}))
export class QuestionSign extends Model {
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

