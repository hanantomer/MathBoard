import {
  Model,
  Column,
  BelongsTo,
  ForeignKey,
  DataType,
  AllowNull,
} from "sequelize-typescript";
import User from "../../user.model";
import Color from "../../color.model";
import Answer from "../../answer/answer.model";
import AnswerDecorator from "../../answer/answerDecorator";

@AnswerDecorator("AnswerDivisionLine")
export default class AnswerDivisionLine extends Model<any, any> {
  notationType = "DIVISIONLINE";
  boardType = "ANSWER";

  @AllowNull(false)
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  uuid!: string;

  @ForeignKey(() => User)
  userId!: number;

  @BelongsTo(() => User, {
    foreignKey: {
      allowNull: false,
    },
  })
  user!: User;

  @ForeignKey(() => Answer)
  answerId!: number;

  @BelongsTo(() => Answer, {
    foreignKey: {
      allowNull: false,
    },
  })
  answer!: Answer;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  p1x!: number;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  p2x!: number;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  p1y!: number;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  p2y!: number;

  @BelongsTo(() => Color, {
    foreignKey: { name: "colorId", field: "colorId", allowNull: true },
  })
  color!: Color;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  dashed!: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  arrowLeft!: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  arrowRight!: boolean;
}