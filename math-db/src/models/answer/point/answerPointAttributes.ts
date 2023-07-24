import { BaseNotation } from "@/models/baseNotation";
import { PointAttributes } from "@/models/pointAttributes";
import { AnswerNotationAttributes } from "@/models/answerNotationAttributes";

import { Optional } from "sequelize";

export interface AnswerPointAttributes
    extends BaseNotation,
        PointAttributes,
        AnswerNotationAttributes {}

export interface AnswerPointCreationAttributes
    extends Optional<AnswerPointAttributes, "id"> {}



