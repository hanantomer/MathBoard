import {
    Model,
    Column,
    DataType,
    BelongsTo,
    ForeignKey,
    AllowNull,
    Table,
} from "sequelize-typescript";
import User from "../user.model";
import Question from "../question/question.model";
import {
    PracticeQuestionMeta,
} from "../../../../math-common/build/practiceQuestionTypes";
import { UserAttributes } from "../../../../math-common/build/userTypes";

export type PracticeQuestionCreationRow = {
    questionId: number;
    subject: string;
    userId: number;
};

@Table({
    timestamps: true,
    tableName: "practiceQuestion",
    freezeTableName: true,
})
export default class PracticeQuestion extends Model<
    PracticeQuestionMeta & { questionId: number; userId: number },
    PracticeQuestionCreationRow
> {
    @AllowNull(false)
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    uuid!: string;

    @ForeignKey(() => Question)
    @AllowNull(false)
    @Column({ type: DataType.INTEGER, unique: true })
    questionId!: number;

    @BelongsTo(() => Question, {
        foreignKey: { name: "questionId", field: "questionId" },
        as: "question",
    })
    question!: Question;

    @AllowNull(false)
    @Column({ type: DataType.STRING })
    subject!: string;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    userId!: number;

    @BelongsTo(() => User, {
        foreignKey: { allowNull: false },
    })
    user!: UserAttributes;
}
