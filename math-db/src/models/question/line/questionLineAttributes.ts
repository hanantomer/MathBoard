import { BaseNotation } from "@/models/baseNotation";
import { LineAttributes } from "@/models/lineAttributes";
import { QuestionNotationAttributes } from "@/models/questionNotationAttributes";

import { Optional } from "sequelize";

export interface QuestionLineAttributes
    extends BaseNotation,
        LineAttributes,
        QuestionNotationAttributes {}

export interface QuestionLineCreationAttributes
    extends Optional<QuestionLineAttributes, "id"> {}

export interface QuestionLineAttributes extends BaseNotation, LineAttributes {}
