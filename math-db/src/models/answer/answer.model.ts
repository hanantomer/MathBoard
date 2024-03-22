import {
    Model,
    Column,
    DataType,
    BelongsTo,
    AllowNull,
} from "sequelize-typescript";
import BoardDecorator from "../boardDecorator";
import User from "../user.model";
import Question from "../question/question.model";
import {
    AnswerAttributes,
    AnswerCreationAttributes,
} from "../../../../math-common/src/answerTypes";

@BoardDecorator("answer")

export default class Answer extends Model<
    AnswerAttributes,
    AnswerCreationAttributes
> {
   
    @BelongsTo(() => User, {
        foreignKey: { name: "userId", field: "userId", allowNull: false },
    })
    user!: User;

   
    @BelongsTo(() => Question, {
        foreignKey: {
            name: "questionId",
            field: "questionId",
            allowNull: false,
        },
    })
    question!: Question;

    @AllowNull(false)
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    uuid!: string;
}
