import { useUserStore } from "../store/pinia/userStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import useImageHelper from "./imageHelper";

import useNotationMutationHelper from "./notationMutateHelper";
import useEventBus from "../helpers/eventBusHelper";

import useSelectionHelper from "../helpers/selectionHelper";
//import { isMobile } from "../../../math-common/src/globals";
const selectionHelper = useSelectionHelper();

const userStore = useUserStore();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();
const notationMutationHelper = useNotationMutationHelper();
const eventBus = useEventBus();
const imageHelper = useImageHelper();

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
    if (notationStore.getCopiedNotations().length) {
      return notationMutationHelper.pasteNotations();
    }

    if (
      e.clipboardData?.items.length &&
      e.clipboardData?.items[0].kind === "string" &&
      e.clipboardData?.types[0].match("^text/plain")
    ) {
      return pasteText(e);
    }

    // Support both Files and Google Docs images (which may come as text/html)
    if (
      e.clipboardData?.types.includes("Files") ||
      e.clipboardData?.types.includes("text/html")
    ) {
      return pasteImage(e);
    }
  }

  async function pasteText(e: ClipboardEvent) {
    const clipboardItems = await navigator.clipboard.read();
    if (!clipboardItems.length) return;
    if (!cellStore.getSelectedCell()) return;
    if (!userStore.isTeacher) return;
    if (clipboardItems[0].types.length === 0) return;
    if (clipboardItems[0].types[0] !== "text/plain") return;

    const initialCell = cellStore.getSelectedCell()!;
    let currentRow = initialCell.row;
    let currentCol = initialCell.col;

    let text = await navigator.clipboard.readText();
    if (!text) return;

    const maxtotalNotationsToPaet = 20;
    let totalNotationsPasted = 0;
    text.split("").forEach((c) => {
      if (c === "\n") {
        // Move to next row and reset column
        currentRow++;
        currentCol = initialCell.col;

        selectionHelper.setSelectedCell(
          { row: currentRow, col: currentCol },
          false,
        );
      } else if (c.trim().length !== 0) {
        notationMutationHelper.addSymbolNotation(c);
        totalNotationsPasted++;
        if (totalNotationsPasted >= maxtotalNotationsToPaet) {
          return;
        }
        // Move to next column
        currentCol++;
      }
    });
  }

  async function pasteImage(e: ClipboardEvent): Promise<void> {
    if (!userStore.isTeacher || !cellStore.getSelectedCell()) return;

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

  function emitKeyUp(key: KeyboardEvent) {
    if (key.altKey) {
      eventBus.emit("EV_SHORTCUT_KEYUP", key);
    } else {
      eventBus.emit("EV_KEYUP", key);
    }
  }

  function emitKeyDown(e: KeyboardEvent) {
    // Use e.key for modern browsers, fallback to e.keyCode for older ones
    if (e.key === " " || e.code === "Space") {
      // Check if the event target is NOT an input, textarea, or a type-able element
      if (
        e.target &&
        (e.target as HTMLElement).tagName !== "INPUT" &&
        (e.target as HTMLElement).tagName !== "TEXTAREA"
      ) {
        e.preventDefault(); // Prevent the default action (scrolling)
      }
    }
  }

  function registerKeyUp() {
    window.addEventListener("keyup", emitKeyUp);
  }

  function unregisterKeyUp() {
    window.removeEventListener("keyup", emitKeyUp);
  }

  function registerKeyDown() {
    window.addEventListener("keydown", emitKeyDown);
  }

  function unregisterKeyDown() {
    window.removeEventListener("keydown", emitKeyDown);
  }

  function emitCopy() {
    eventBus.emit("EV_COPY", null);
  }

  function registerCopy() {
    document.addEventListener("copy", emitCopy);
  }

  function unregisterCopy() {
    document.removeEventListener("copy", emitCopy);
  }

  function emitPaste(e: ClipboardEvent) {
    eventBus.emit("EV_PASTE", e);
  }

  function registerPaste() {
    document.addEventListener("paste", emitPaste);
  }

  function unregisterPaste() {
    document.removeEventListener("paste", emitPaste);
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
