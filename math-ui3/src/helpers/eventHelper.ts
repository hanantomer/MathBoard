import { matrixDimensions } from "common/globals";
import { RectAttributes } from "common/baseTypes";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import useImageHelper from "./imageHelper";

import useNotationMutationHelper from "./notationMutateHelper";
import useEventBus from "../helpers/eventBusHelper";
import useAuthorizationHelper from "./authorizationHelper";
import {
  isBlankPracticeBoard,
  PRACTICE_PROBLEM_ROLE,
} from "./practiceBoardAdapter";
import {
  getPracticeProblemImageBase64,
  getPracticeProblemText,
} from "./practiceCheckHelper";

import useSelectionHelper from "../helpers/selectionHelper";
import {
  isNativeTextFieldPaste,
  normalizePastedBoardText,
} from "./pastedTextHelper";
//import { isMobile } from "../../../math-common/src/globals";
const selectionHelper = useSelectionHelper();

const notationStore = useNotationStore();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();
const notationMutationHelper = useNotationMutationHelper();
const eventBus = useEventBus();
const imageHelper = useImageHelper();
const authorizationHelper = useAuthorizationHelper();

/** Stable window listeners — must be module-scoped so remounts do not stack duplicates. */
function onWindowKeyUp(key: KeyboardEvent) {
  if (key.altKey) {
    eventBus.emit("EV_SHORTCUT_KEYUP", key);
  } else {
    eventBus.emit("EV_KEYUP", key);
  }
}

function onWindowKeyDown(e: KeyboardEvent) {
  if (e.key === " " || e.code === "Space") {
    if (
      e.target &&
      (e.target as HTMLElement).tagName !== "INPUT" &&
      (e.target as HTMLElement).tagName !== "TEXTAREA"
    ) {
      e.preventDefault();
    }
  }
}

function registerKeyUp() {
  window.removeEventListener("keyup", onWindowKeyUp);
  window.addEventListener("keyup", onWindowKeyUp);
}

function unregisterKeyUp() {
  window.removeEventListener("keyup", onWindowKeyUp);
}

function registerKeyDown() {
  window.removeEventListener("keydown", onWindowKeyDown);
  window.addEventListener("keydown", onWindowKeyDown);
}

function unregisterKeyDown() {
  window.removeEventListener("keydown", onWindowKeyDown);
}

function onDocumentCopy() {
  eventBus.emit("EV_COPY", null);
}

function onDocumentPaste(e: ClipboardEvent) {
  eventBus.emit("EV_PASTE", e);
}

let lastBoardPasteAt = 0;
let lastBoardPasteText = "";

export default function eventHelper() {
  async function copy() {
    notationStore.setCopiedNotations(
      notationStore.getSelectedNotations().sort((n1: any, n2: any) => {
        return (n1.row | n1.fromRow) > (n2.row | n2.fromRow) ||
          (n1.col | n1.fromCol) > (n2.col | n2.fromCol)
          ? 1
          : -1;
      }),
    );
  }

  async function paste(e: ClipboardEvent) {
    if (isNativeTextFieldPaste(e.target)) {
      return;
    }

    if (notationStore.getCopiedNotations().length) {
      e.preventDefault();
      return notationMutationHelper.pasteNotations();
    }

    const types = e.clipboardData?.types;
    const hasFiles = !!types?.includes("Files");
    const plainText = normalizePastedBoardText(
      e.clipboardData?.getData("text/plain") ?? "",
      e.clipboardData?.getData("text/html") ?? "",
    );

    if (hasFiles && !plainText.trim()) {
      e.preventDefault();
      return pasteImage(e);
    }

    if (plainText.trim()) {
      return pasteText(plainText, e);
    }

    // Support Google Docs / HTML-embedded images when there is no plain text.
    if (types?.includes("text/html")) {
      e.preventDefault();
      return pasteImage(e);
    }
  }

  function textBoxRectForPastedText(
    text: string,
    fromCol: number,
    fromRow: number,
  ): RectAttributes {
    const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
    const maxLineLen = Math.max(1, ...lines.map((line) => line.length));
    const availableCols = Math.max(1, matrixDimensions.colsNum - fromCol);
    const availableRows = Math.max(1, matrixDimensions.rowsNum - fromRow);
    // Cap width so a one-line problem wraps instead of spanning the board.
    const MAX_PASTE_COLS = 40;
    const colSpan = Math.min(
      Math.max(10, maxLineLen + 2),
      availableCols,
      MAX_PASTE_COLS,
    );
    const wrappedRows = lines.reduce(
      (sum, line) => sum + Math.max(1, Math.ceil(line.length / colSpan)),
      0,
    );
    const rowSpan = Math.min(Math.max(3, wrappedRows + 1), availableRows);

    return {
      fromCol,
      toCol: fromCol + colSpan - 1,
      fromRow,
      toRow: fromRow + rowSpan - 1,
    };
  }

  function pasteText(text: string, e: ClipboardEvent) {
    if (!authorizationHelper.canEdit()) return;
    ensurePasteAnchorCell();
    const cell = cellStore.getSelectedCell();
    if (!cell) return;

    e.preventDefault();
    const now = Date.now();
    if (text === lastBoardPasteText && now - lastBoardPasteAt < 400) {
      return;
    }
    lastBoardPasteAt = now;
    lastBoardPasteText = text;

    const fromCol = Math.min(
      Math.max(0, cell.col),
      matrixDimensions.colsNum - 1,
    );
    const fromRow = Math.min(
      Math.max(0, cell.row),
      matrixDimensions.rowsNum - 1,
    );
    const notations = notationStore.getNotations();
    const markAsProblem =
      isBlankPracticeBoard() &&
      !getPracticeProblemImageBase64(notations) &&
      !getPracticeProblemText(notations);

    notationMutationHelper.addTextNotation(
      text,
      textBoxRectForPastedText(text, fromCol, fromRow),
      markAsProblem ? { practiceRole: PRACTICE_PROBLEM_ROLE } : undefined,
    );
  }

  function ensurePasteAnchorCell() {
    if (cellStore.getSelectedCell()) return;
    selectionHelper.setSelectedCell({ col: 1, row: 1 }, true);
  }

  async function pasteImage(e: ClipboardEvent): Promise<void> {
    if (!authorizationHelper.canEdit()) return;
    ensurePasteAnchorCell();
    if (!cellStore.getSelectedCell()) return;

    try {
      window.focus();
      let htmlData: string | null = null;

      // Log available clipboard MIME types for debugging
      if (e.clipboardData) {
        console.debug("Clipboard MIME types:", e.clipboardData.types);
        htmlData = e.clipboardData.getData("text/html");
      }

      // First, try the Clipboard API
      if (navigator.clipboard?.read) {
        console.debug("Attempting Clipboard API read...");
        const clipboardItems = await navigator.clipboard.read();
        for (const clipboardItem of clipboardItems) {
          console.debug("Clipboard item types:", clipboardItem.types);
          const imageType = clipboardItem.types.find((type: string) =>
            type.startsWith("image/"),
          );
          if (imageType) {
            console.debug("Found image type:", imageType);
            const blob: Blob = await clipboardItem.getType(imageType);
            if (!blob) return;
            const base64 = await imageHelper.convertBlobToBase64GrayScale(blob);
            notationMutationHelper.addImageNotation(base64);
            return;
          }
          const htmlType = clipboardItem.types.find((type: string) =>
            type.startsWith("text/html"),
          );
          if (htmlType && e.clipboardData) {
            console.debug("Found html type:", htmlType);
            if (htmlData) {
              console.debug("HTML Clipboard Data:", htmlData);
              const match: RegExpMatchArray | null = htmlData.match(
                /<img[^>]+src=["']([^"']+)["']/i,
              );
              if (match && match[1]) {
                console.debug("Found image src in HTML:", match[1]);
                const src: string = match[1];
                const base64: string = src.startsWith("data:image/")
                  ? src
                  : await imageHelper.convertImageToBase64(src);
                notationMutationHelper.addImageNotation(base64);
                return;
              } else {
                console.warn("No image found in HTML clipboard data");
              }
            }
          }
        }
        console.debug("No image found in Clipboard API");
      } else {
        console.debug("Clipboard API not available");
      }

      // Fallback: Handle clipboard data from event

      if (e.clipboardData) {
        // Check for binary image data
        const items: DataTransferItemList = e.clipboardData.items;
        for (const item of Array.from(items)) {
          if (item.type.startsWith("image/")) {
            console.debug("Found binary image in clipboard, type:", item.type);
            const blob: File | null = item.getAsFile();
            if (blob) {
              const base64: string =
                await imageHelper.convertBlobToBase64GrayScale(blob);
              notationMutationHelper.addImageNotation(base64);
              return;
            }
          }
        }

        // Check for base64 or URL in text/html
        const htmlData: string = e.clipboardData.getData("text/html");

        if (htmlData) {
          console.debug("HTML Clipboard Data:", htmlData);
          const match: RegExpMatchArray | null = htmlData.match(
            /<img[^>]+src=["']([^"']+)["']/i,
          );
          if (match && match[1]) {
            console.debug("Found image src in HTML:", match[1]);
            const src: string = match[1];
            const base64: string = src.startsWith("data:image/")
              ? src
              : await imageHelper.convertImageToBase64(src);
            notationMutationHelper.addImageNotation(base64);
            return;
          } else {
            console.warn("No image found in HTML clipboard data");
          }
        } else {
          console.warn("No HTML clipboard data available");
        }

        // Additional debugging: Check other MIME types
        for (const type of e.clipboardData.types) {
          if (type !== "text/html" && !type.startsWith("image/")) {
            console.debug(
              `Clipboard data for type ${type}:`,
              e.clipboardData.getData(type),
            );
          }
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error(
        "Paste image error:",
        error.name,
        error.message,
        error.stack,
      );
    }
  }

  function registerSvgPointerDown() {
    document
      ?.getElementById(cellStore.getSvgId()!)
      ?.addEventListener("pointerdown", emitSvgPointerDown, { passive: true });
  }

  function unregisterSvgPointerDown() {
    document
      ?.getElementById(cellStore.getSvgId()!)
      ?.removeEventListener("pointerdown", emitSvgPointerDown);
  }

  function emitSvgPointerDown(e: PointerEvent) {
    //const isTouch = e.pointerType === "touch";

    //if (!editModeStore.isDrawingMode() && isTouch) {
    //  return; // Don't start drawing if it's a touch event and we're not in drawing mode
    //}

    if (cellStore.getSvgId()) {
      cellStore.refreshSvgBoundingRect();
    }

    eventBus.emit("EV_SVG_POINTERDOWN", e);
  }

  function registerSvgPointerMove() {
    document
      ?.getElementById(cellStore.getSvgId()!)
      ?.addEventListener("pointermove", emitSvgPointerMove, { passive: true });
  }

  function unregisterSvgPointerMove() {
    document
      ?.getElementById(cellStore.getSvgId()!)
      ?.removeEventListener("pointermove", emitSvgPointerMove);
  }

  function emitSvgPointerMove(e: PointerEvent) {
    const isTouch = e.pointerType === "touch";
    const isActivePointer = isTouch ? e.isPrimary : (e.buttons & 1) !== 0;

    if (!isActivePointer) return;

    eventBus.emit("EV_SVG_POINTERMOVE", e);
  }

  function registerSvgPointerUp() {
    document
      ?.getElementById(cellStore.getSvgId()!)
      ?.addEventListener("pointerup", emitSvgPointerUp);
  }

  function unregisterSvgPointerUp() {
    document
      ?.getElementById(cellStore.getSvgId()!)
      ?.removeEventListener("pointerup", emitSvgPointerUp);
  }

  function emitSvgPointerUp(e: PointerEvent) {
    if (cellStore.getSvgId()) {
      cellStore.refreshSvgBoundingRect();
    }

    eventBus.emit("EV_SVG_POINTERUP", e);
  }

  function registerSvgPointerCancel() {
    document
      ?.getElementById(cellStore.getSvgId()!)
      ?.addEventListener("pointercancel", emitSvgPointerCancel);
  }

  function unregisterSvgPointerCancel() {
    document
      ?.getElementById(cellStore.getSvgId()!)
      ?.removeEventListener("pointercancel", emitSvgPointerCancel);
  }

  function emitSvgPointerCancel(e: PointerEvent) {
    eventBus.emit("EV_SVG_POINTERCANCEL", e);
  }

  function registerPointerUp() {
    document.addEventListener("pointerup", emitPointerUp);
  }

  function unregisterPointerUp() {
    document.removeEventListener("pointerup", emitPointerUp);
  }

  function emitPointerUp(e: PointerEvent) {
    eventBus.emit("EV_POINTERUP", e);
  }

  function registerCopy() {
    document.removeEventListener("copy", onDocumentCopy);
    document.addEventListener("copy", onDocumentCopy);
  }

  function unregisterCopy() {
    document.removeEventListener("copy", onDocumentCopy);
  }

  function registerPaste() {
    document.removeEventListener("paste", onDocumentPaste);
    document.addEventListener("paste", onDocumentPaste);
  }

  function unregisterPaste() {
    document.removeEventListener("paste", onDocumentPaste);
  }

  // Mobile support
  let lastTapTime = 0;
  function emitMobileEscape(e: TouchEvent) {
    //if (!isMobile()) return;
    const currentTime = Date.now();
    const tapDelay = currentTime - lastTapTime;
    if (tapDelay < 300 && tapDelay > 0) {
      // Double tap within 300ms
      eventBus.emit("EV_MOBILE_ESCAPE", null);
    }
    lastTapTime = currentTime;
  }

  function registerMobileEscape() {
    //if (isMobile()) {
    document.removeEventListener("touchstart", emitMobileEscape);
    document.addEventListener("touchstart", emitMobileEscape);
    //}
  }

  function unregisterMobileEscape() {
    document.removeEventListener("touchstart", emitMobileEscape);
  }

  return {
    copy,
    paste,
    registerSvgPointerDown,
    registerSvgPointerMove,
    registerSvgPointerUp,
    registerSvgPointerCancel,
    registerPointerUp,
    registerKeyUp,
    registerKeyDown,
    registerPaste,
    registerCopy,
    registerMobileEscape,
    unregisterSvgPointerDown,
    unregisterSvgPointerMove,
    unregisterSvgPointerUp,
    unregisterSvgPointerCancel,
    unregisterPointerUp,
    unregisterKeyUp,
    unregisterKeyDown,
    unregisterPaste,
    unregisterCopy,
    unregisterMobileEscape,
  };
}
