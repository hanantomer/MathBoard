import { PRACTICE_BLANK_UUID } from "common/globals";
import {
  CellAttributes,
  isCellNotationType,
  NotationAttributes,
  NotationCreationAttributes,
} from "common/baseTypes";
import { BoardType, NotationType, NotationTypeValues } from "common/unions";
import useApiHelper from "./apiHelper";
import { useNotationStore } from "../store/pinia/notationStore";
import { usePracticeStore } from "../store/pinia/practiceStore";

export { PRACTICE_BLANK_UUID };

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
  notation: NotationCreationAttributes,
): NotationAttributes {
  const questionUUId = getPracticeQuestionUUId();
  const uuid = crypto.randomUUID();
  const newNotation = {
    ...notation,
    uuid,
    boardType: "PRACTICE" as BoardType,
    parentUUId: questionUUId,
  } as NotationAttributes;

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

export function removeLocalPracticeNotation(notationUUId: string) {
  if (!isPracticeBoard()) return;
  usePracticeStore().removeNotation(getPracticeQuestionUUId(), notationUUId);
}

/**
 * Load QUESTION stem from the API + PRACTICE student layer from sessionStorage.
 * Blank sheet: local PRACTICE layer only (no stem).
 */
export async function loadPracticeBoard(questionUUId: string) {
  const notationStore = useNotationStore();
  const apiHelper = useApiHelper();
  const notations: NotationAttributes[] = [];

  try {
    notationStore.haltSaveState();

    if (questionUUId !== PRACTICE_BLANK_UUID) {
      for (let i = 0; i < NotationTypeValues.length; i++) {
        const notationType = NotationTypeValues[i] as NotationType;
        try {
          const stemNotations = await loadStemNotationsByType(
            apiHelper,
            notationType,
            questionUUId,
          );
          if (!stemNotations) continue;
          stemNotations.forEach((n) => {
            notations.push({
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
    }

    const practiceNotations = usePracticeStore()
      .getNotations(questionUUId)
      .map((n) => ({ ...n, boardType: "PRACTICE" as BoardType }));
    notations.push(...practiceNotations);

    notationStore.setNotations(notations);
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

  handlers.resetSelectedNotations();
  handlers.setSelectedCell(clickedCell, true);
  return true;
}
