import { BaseNotation } from "@/models/baseNotation";
import { RectAttributes } from "@/models/rectAttributes";
import { AnswerNotationAttributes } from "@/models/answerNotationAttributes";

import { Optional } from "sequelize";

export interface AnswerRectAttributes
    extends BaseNotation,
        RectAttributes,
        AnswerNotationAttributes {}

export interface AnswerRectCreationAttributes
    extends Optional<AnswerRectAttributes, "id"> {}
