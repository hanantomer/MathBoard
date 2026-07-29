import {
  NotationCreationAttributes,
  RectNotationCreationAttributes,
  PointNotationCreationAttributes,
  LineNotationCreationAttributes,
  AnnotationNotationCreationAttributes,
  CurveNotationCreationAttributes,
  SqrtNotationCreationAttributes,
  ExponentNotationCreationAttributes,
} from "../../math-common/build/baseTypes";
import { type LessonTemplateNotation } from "../../math-common/build/lessonTemplates";
import { UserAttributes } from "../../math-common/build/userTypes";

export function toQuestionStemNotation(
  item: LessonTemplateNotation,
  questionUUId: string,
  user: UserAttributes,
): NotationCreationAttributes {
  const base = {
    boardType: "QUESTION" as const,
    parentUUId: questionUUId,
    user,
  };

  switch (item.kind) {
    case "SYMBOL": {
      const notation: PointNotationCreationAttributes = {
        ...base,
        notationType: "SYMBOL",
        col: item.col,
        row: item.row,
        value: item.value,
      };
      return notation;
    }
    case "TEXT": {
      const notation: RectNotationCreationAttributes = {
        ...base,
        notationType: "TEXT",
        fromCol: item.fromCol,
        toCol: item.toCol,
        fromRow: item.fromRow,
        toRow: item.toRow,
        value: item.value,
      };
      return notation;
    }
    case "LINE": {
      const notation: LineNotationCreationAttributes = {
        ...base,
        notationType: "LINE",
        p1x: item.p1x,
        p1y: item.p1y,
        p2x: item.p2x,
        p2y: item.p2y,
        dashed: item.dashed ?? false,
        arrowLeft: item.arrowLeft ?? false,
        arrowRight: item.arrowRight ?? false,
        color: null,
      };
      return notation;
    }
    case "ANNOTATION": {
      const notation: AnnotationNotationCreationAttributes = {
        ...base,
        notationType: "ANNOTATION",
        x: item.x,
        y: item.y,
        value: item.value,
      };
      return notation;
    }
    case "CURVE": {
      const notation: CurveNotationCreationAttributes = {
        ...base,
        notationType: "CURVE",
        p1x: item.p1x,
        p1y: item.p1y,
        p2x: item.p2x,
        p2y: item.p2y,
        cpx: item.cpx,
        cpy: item.cpy,
        color: null,
      };
      return notation;
    }
    case "SQRT": {
      const notation: SqrtNotationCreationAttributes = {
        ...base,
        notationType: "SQRT",
        fromCol: item.fromCol,
        toCol: item.toCol,
        row: item.row,
      };
      return notation;
    }
    case "EXPONENT": {
      const notation: ExponentNotationCreationAttributes = {
        ...base,
        notationType: "EXPONENT",
        col: item.col,
        row: item.row,
        value: item.value,
      };
      return notation;
    }
  }
}
