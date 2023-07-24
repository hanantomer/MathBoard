import { BaseNotation } from "@/models/baseNotation";
import { PointAttributes } from "@/models/pointAttributes";
import { QuestionNotationAttributes } from "@/models/questionNotationAttributes";
import { Optional } from "sequelize";

export interface QuestionPointAttributes
    extends BaseNotation,
        PointAttributes,
        QuestionNotationAttributes {}

export interface QuestionPointCreationAttributes
    extends Optional<QuestionPointAttributes, "id"> {}
