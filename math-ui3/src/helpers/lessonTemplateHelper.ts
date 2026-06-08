import {
  NotationCreationAttributes,
  RectNotationCreationAttributes,
  PointNotationCreationAttributes,
  LineNotationCreationAttributes,
  AnnotationNotationCreationAttributes,
  CurveNotationCreationAttributes,
  SqrtNotationCreationAttributes,
  ExponentNotationCreationAttributes,
} from "common/baseTypes";
import { LessonAttributes } from "common/lessonTypes";
import {
  getLessonTemplate,
  type LessonTemplateNotation,
} from "common/lessonTemplates";
import { UserAttributes } from "common/userTypes";
import useApiHelper from "./apiHelper";

function toCreationNotation(
  item: LessonTemplateNotation,
  lessonUUId: string,
  user: UserAttributes,
): NotationCreationAttributes {
  const base = {
    boardType: "LESSON" as const,
    parentUUId: lessonUUId,
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

export default function useLessonTemplateHelper() {
  const api = useApiHelper();

  async function createLessonFromTemplate(
    templateId: string,
    user: UserAttributes,
  ): Promise<LessonAttributes> {
    const template = getLessonTemplate(templateId);
    if (!template) {
      throw new Error(`Unknown lesson template: ${templateId}`);
    }

    const lesson = await api.addLesson({
      name: template.name,
      user,
    });

    for (const item of template.notations) {
      try {
        const created = await api.addNotation(
          toCreationNotation(item, lesson.uuid, user),
        );
        if (!created?.uuid) {
          throw new Error("server returned no notation uuid");
        }
      } catch (error) {
        throw new Error(
          `Failed to add ${item.kind} notation to lesson template "${templateId}": ${(error as Error).message}`,
        );
      }
    }

    return lesson;
  }

  return { createLessonFromTemplate };
}
