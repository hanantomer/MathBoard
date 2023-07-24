import { BaseNotation } from "@/models/baseNotation";
import { LineAttributes } from "@/models/lineAttributes";
import { LessonNotationAttributes } from "@/models/lessonNotationAttributes";

import { Optional } from "sequelize";

export interface LessonLineAttributes
    extends BaseNotation,
        LineAttributes,
        LessonNotationAttributes {}

export interface LessonLineCreationAttributes
    extends Optional<LessonLineAttributes, "id"> {}

