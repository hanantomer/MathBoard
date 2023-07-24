import { BaseNotation } from "@/models/baseNotation";
import { RectAttributes } from "@/models/rectAttributes";
import { LessonNotationAttributes } from "@/models/lessonNotationAttributes";
import { Optional } from "sequelize";

export interface LessonRectAttributes
    extends BaseNotation,
        RectAttributes,
        LessonNotationAttributes {}

export interface LessonRectCreationAttributes
    extends Optional<LessonRectAttributes, "id"> {}
