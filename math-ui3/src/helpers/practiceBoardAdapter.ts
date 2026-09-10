import { PRACTICE_BLANK_UUID } from "common/globals";
import {
  CellAttributes,
  isCellNotationType,
  NotationAttributes,
  NotationCreationAttributes,
} from "common/baseTypes";
import { BoardType, NotationType, NotationTypeValues } from "common/unions";
import {
  ensureNumberedParts,
  hasPracticeSections,
} from "common/practiceParts";
import {
  formatPracticeProblemPrompt,
  getPracticeQuestionTemplateByUUId,
} from "common/practiceQuestionTemplates";
import useApiHelper from "./apiHelper";
import { useNotationStore } from "../store/pinia/notationStore";
import { usePracticeStore } from "../store/pinia/practiceStore";

export { PRACTICE_BLANK_UUID };

/** Marks a local PRACTICE notation as the pasted/uploaded problem on a blank sheet. */
export const PRACTICE_PROBLEM_ROLE = "problem" as const;

export type PracticeNotationExtras = {
  practiceRole?: typeof PRACTICE_PROBLEM_ROLE;
};

export function isPracticeProblemNotation(
  notation: NotationAttributes | null | undefined,
): boolean {
  return (
    (notation as (NotationAttributes & PracticeNotationExtras) | null)
      ?.practiceRole === PRACTICE_PROBLEM_ROLE
  );
}

/**
 * Practice / AI-tutor board boundary.
 * Owns local persistence, load of stem + practice layer, selection rules, and canEdit.
 * Lesson/answer paths must not grow practice branches — call this adapter instead.
 */
export function isPracticeBoard(): boolean {
  return useNotationStore().getParent()?.type === "PRACTICE";
}

export function isBlankPracticeBoard(): boolean {
  return (
    isPracticeBoard() &&
    useNotationStore().getParent()?.uuid === PRACTICE_BLANK_UUID
  );
}

/** Unsubmitted blank (or catalog before stem load): paste goes to the problem pane. */
export function shouldCapturePracticeProblemPaste(): boolean {
  if (!isPracticeBoard()) return false;
  try {
    return !usePracticeStore().getSession(getPracticeQuestionUUId()).submitted;
  } catch {
    return false;
  }
}

export function getPracticeQuestionUUId(): string {
  const parent = useNotationStore().getParent();
  if (!parent) {
    throw new Error("practice board parent is not set");
  }
  return parent.uuid;
}

/** Practice boards are always editable for the active learner. */
export function canEdit(): boolean {
  return isPracticeBoard();
}

export function isPracticeLayer(
  notation: NotationAttributes | null | undefined,
): boolean {
  return notation?.boardType === "PRACTICE";
}

export function createLocalPracticeNotation(
  notation: NotationCreationAttributes & PracticeNotationExtras,
): NotationAttributes & PracticeNotationExtras {
  const questionUUId = getPracticeQuestionUUId();
  const uuid = crypto.randomUUID();
  const newNotation = {
    ...notation,
    uuid,
    boardType: "PRACTICE" as BoardType,
    parentUUId: questionUUId,
  } as NotationAttributes & PracticeNotationExtras;

  usePracticeStore().upsertNotation(questionUUId, newNotation);
  return newNotation;
}

export function persistPracticeNotation(notation: NotationAttributes) {
  if (!isPracticeBoard()) return;
  const questionUUId = getPracticeQuestionUUId();
  usePracticeStore().upsertNotation(questionUUId, {
    ...notation,
    boardType: "PRACTICE",
    parentUUId: questionUUId,
  });
}

/** Lock current blank-sheet work as the question stem, then the student solves. */
export function markCurrentPracticeNotationsAsProblem() {
  if (!isPracticeBoard()) return;
  const notationStore = useNotationStore();
  const snapshot = [...notationStore.getNotations()];
  notationStore.beginUndoGroup();
  try {
    for (const notation of snapshot) {
      if (notation.boardType !== "PRACTICE") continue;
      if (isPracticeProblemNotation(notation)) continue;
      const marked = {
        ...notation,
        practiceRole: PRACTICE_PROBLEM_ROLE,
      } as NotationAttributes & PracticeNotationExtras;
      notationStore.addNotation(marked, true, false);
      persistPracticeNotation(marked);
    }
  } finally {
    notationStore.endUndoGroup();
  }
}

export function removeLocalPracticeNotation(notationUUId: string) {
  if (!isPracticeBoard()) return;
  usePracticeStore().removeNotation(getPracticeQuestionUUId(), notationUUId);
}

function joinStemNotations(notations: NotationAttributes[]): string {
  const lines: string[] = [];
  for (const n of notations) {
    if (n.notationType === "TEXT" || n.notationType === "ANNOTATION") {
      const value = String(
        (n as NotationAttributes & { value?: string }).value ?? "",
      ).trim();
      if (value) lines.push(value);
    }
  }
  if (lines.length) return lines.join("\n");
  const symbols = notations
    .filter(
      (n) =>
        n.notationType === "SYMBOL" ||
        n.notationType === "EXPONENT" ||
        n.notationType === "LOGBASE",
    )
    .map((n) =>
      String((n as NotationAttributes & { value?: string }).value ?? "").trim(),
    )
    .filter(Boolean);
  return symbols.join("");
}

function partsMatch(
  a: { id: string; text: string }[],
  b: { id: string; text: string }[],
): boolean {
  if (a.length !== b.length) return false;
  return a.every((part, i) => part.id === b[i].id && part.text === b[i].text);
}

function submitStemIfNeeded(questionUUId: string, stemText: string) {
  const practiceStore = usePracticeStore();
  const text = stemText.trim();
  if (!text) return;
  const session = practiceStore.getSession(questionUUId);
  const parts = ensureNumberedParts(text);
  const leftoverNumbers =
    !hasPracticeSections(parts) &&
    Object.keys(session.partLabelRows ?? {}).length > 0;
  if (
    session.submitted &&
    session.problemText === text &&
    partsMatch(session.parts, parts) &&
    !leftoverNumbers
  ) {
    return;
  }
  practiceStore.submitProblem(questionUUId, {
    problemText: text,
    parts,
  });
}

/**
 * Load PRACTICE student layer from sessionStorage.
 * Catalog QUESTION stem is submitted into the problem pane, not drawn on the board.
 * Blank sheet: local PRACTICE layer only; leftover `practiceRole` stems migrate to the pane.
 */
export async function loadPracticeBoard(questionUUId: string) {
  const notationStore = useNotationStore();
  const apiHelper = useApiHelper();
  const practiceStore = usePracticeStore();

  try {
    notationStore.haltSaveState();

    if (questionUUId !== PRACTICE_BLANK_UUID) {
      const stemNotations: NotationAttributes[] = [];
      for (let i = 0; i < NotationTypeValues.length; i++) {
        const notationType = NotationTypeValues[i] as NotationType;
        try {
          const fetched = await loadStemNotationsByType(
            apiHelper,
            notationType,
            questionUUId,
          );
          if (!fetched) continue;
          fetched.forEach((n) => {
            stemNotations.push({
              ...n,
              notationType,
              boardType: "QUESTION",
            });
          });
        } catch (error) {
          console.warn(
            `Skipping QUESTION ${notationType} notations for ${questionUUId}:`,
            error,
          );
        }
      }

      const template = getPracticeQuestionTemplateByUUId(questionUUId);
      const stemText = template
        ? formatPracticeProblemPrompt(template)
        : joinStemNotations(stemNotations);
      submitStemIfNeeded(questionUUId, stemText || "Practice question");
    }

    let practiceNotations = practiceStore
      .getNotations(questionUUId)
      .map((n) => ({ ...n, boardType: "PRACTICE" as BoardType }));

    if (questionUUId === PRACTICE_BLANK_UUID) {
      const problems = practiceNotations.filter(isPracticeProblemNotation);
      const work = practiceNotations.filter((n) => !isPracticeProblemNotation(n));
      if (problems.length && !practiceStore.getSession(questionUUId).submitted) {
        const stemText = joinStemNotations(problems);
        if (stemText) submitStemIfNeeded(questionUUId, stemText);
      }
      practiceNotations = work;
    }

    notationStore.setNotations(practiceNotations);

    const session = practiceStore.getSession(questionUUId);
    if (session.submitted && !session.activePartId) {
      practiceStore.setActivePart(
        questionUUId,
        session.parts[0]?.id ?? "1",
      );
    }
  } finally {
    notationStore.activateSaveState();
  }
}

async function loadStemNotationsByType(
  apiHelper: ReturnType<typeof useApiHelper>,
  notationType: NotationType,
  parentUUId: string,
): Promise<NotationAttributes[]> {
  switch (notationType) {
    case "EXPONENT":
    case "LOGBASE":
    case "ANNOTATION":
    case "SYMBOL":
    case "SQRT":
    case "DIVISIONLINE":
    case "LINE":
    case "IMAGE":
    case "TEXT":
    case "CURVE":
    case "CIRCLE":
    case "CONIC":
    case "FREESKETCH":
      return await apiHelper.getNotations(notationType, "QUESTION", parentUUId);
    case "POLYGON":
    case "SQRTSYMBOL":
      return [];
    default:
      throw new Error(`${notationType} :notation type is invalid`);
  }
}

export type PracticeClickHandlers = {
  selectNotation: (uuid: string) => void;
  setSelectedCell: (cell: CellAttributes, show: boolean) => void;
  resetSelectedNotations: () => void;
};

/**
 * Practice selection: QUESTION stem is display-only; PRACTICE layer is editable.
 * Returns true when the click was handled (caller should return).
 * Returns false when there was no DOM hit so the caller can proximity-select
 * thin shapes (lines, curves, etc.).
 */
export function handlePracticeClick(
  clickedNotation: NotationAttributes | null,
  clickedCell: CellAttributes,
  handlers: PracticeClickHandlers,
): boolean {
  if (!isPracticeBoard()) return false;

  if (isPracticeLayer(clickedNotation)) {
    handlers.resetSelectedNotations();
    handlers.selectNotation(clickedNotation!.uuid);
    if (isCellNotationType(clickedNotation!.notationType)) {
      handlers.setSelectedCell(clickedCell, true);
    }
    return true;
  }

  // Missed the SVG element — let caller use distance-based selection.
  if (!clickedNotation) {
    return false;
  }

  // QUESTION stem (or other non-practice): select cell only.
  handlers.resetSelectedNotations();
  handlers.setSelectedCell(clickedCell, true);
  return true;
}
