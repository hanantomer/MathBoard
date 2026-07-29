import {
  AnnotationNotationAttributes,
  NotationAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
} from "common/baseTypes";

/** Serialize PRACTICE-layer notations into text for the grading API. */
export function serializePracticeStudentWork(
  notations: NotationAttributes[],
): string {
  const practiceOnly = notations.filter((n) => n.boardType === "PRACTICE");
  if (practiceOnly.length === 0) {
    return "";
  }

  const lines: string[] = [];

  const pointLike = practiceOnly.filter(
    (n) =>
      n.notationType === "SYMBOL" ||
      n.notationType === "EXPONENT" ||
      n.notationType === "LOGBASE",
  ) as PointNotationAttributes[];

  pointLike.sort((a, b) => a.row - b.row || a.col - b.col);

  let currentRow = Number.NaN;
  let rowBuf = "";
  for (const n of pointLike) {
    if (n.row !== currentRow) {
      if (rowBuf) lines.push(rowBuf);
      currentRow = n.row;
      rowBuf = n.value ?? "";
    } else {
      rowBuf += n.value ?? "";
    }
  }
  if (rowBuf) lines.push(rowBuf);

  for (const n of practiceOnly) {
    if (n.notationType === "TEXT") {
      const t = n as RectNotationAttributes;
      if (t.value?.trim()) lines.push(t.value.trim());
    } else if (n.notationType === "ANNOTATION") {
      const a = n as AnnotationNotationAttributes;
      if (a.value?.trim()) lines.push(a.value.trim());
    } else if (n.notationType === "FREESKETCH") {
      lines.push("[freehand sketch]");
    }
  }

  return lines.join("\n").trim();
}
