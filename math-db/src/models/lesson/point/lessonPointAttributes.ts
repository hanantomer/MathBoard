import { BaseNotation } from "@/models/baseNotation";
import { PointAttributes } from "@/models/pointAttributes";
import { Optional } from "sequelize";
import { LessonNotationAttributes } from "@/models/lessonNotationAttributes"

export interface LessonPointAttributes
    extends BaseNotation,
        PointAttributes,
        LessonNotationAttributes {}

export interface LessonPointCreationAttributes
    extends Optional<LessonPointAttributes, "id"> {}
