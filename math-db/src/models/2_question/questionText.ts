import { User } from "../user";
import { Lesson } from "../1_lesson/lesson";
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
    tableName: "questionText",
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
export class QuestionText extends Model {
    @BelongsTo(() => Lesson)
    lesson: Lesson;
    
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

