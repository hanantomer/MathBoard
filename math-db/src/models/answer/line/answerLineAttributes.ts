import { BaseNotation } from "@/models/baseNotation";
import { LineAttributes } from "@/models/lineAttributes";
import { AnswerNotationAttributes } from "@/models/answerNotationAttributes";
import { Optional } from "sequelize";

export interface AnswerLineAttributes
    extends BaseNotation,
        LineAttributes,
        AnswerNotationAttributes {}

export interface AnswerLineCreationAttributes
    extends Optional<AnswerLineAttributes, "id"> {}
