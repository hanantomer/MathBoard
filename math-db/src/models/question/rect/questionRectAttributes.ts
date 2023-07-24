import { BaseNotation } from "@/models/baseNotation";
import { RectAttributes } from "@/models/rectAttributes";
import { QuestionNotationAttributes } from "@/models/questionNotationAttributes";
import { Optional } from "sequelize";

export interface QuestionRectAttributes
    extends BaseNotation,
        RectAttributes,
        QuestionNotationAttributes {}

export interface QuestionRectCreationAttributes
    extends Optional<QuestionRectAttributes, "id"> {}
