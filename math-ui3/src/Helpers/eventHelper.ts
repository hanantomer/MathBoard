import { useUserStore } from "../store/pinia/userStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";

import useNotationMutationHelper from "./notationMutateHelper";
import useEventBus from "../helpers/eventBusHelper";
import {
  NotationAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
  HorizontalLineNotationAttributes,
  VerticalLineNotationAttributes,
  SlopeLineNotationAttributes,
  CurveNotationAttributes,
  SqrtNotationAttributes,
  CellAttributes,
} from "common/baseTypes";

import useSelectionHelper from "../helpers/selectionHelper";
const selectionHelper = useSelectionHelper();

const userStore = useUserStore();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const notationMutationHelper = useNotationMutationHelper();
const eventBus = useEventBus();

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
      return pasteNotations();
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

  async function pasteNotations() {
    const selectedCell = cellStore.getSelectedCell();
    if (!selectedCell) return;

    let firstRow: number | null = null;
    let firstCol: number | null = null;

    notationStore.getCopiedNotations().forEach((n: NotationAttributes) => {
      switch (n.notationType) {
        case "SYMBOL":
        case "SIGN":
        case "SQRTSYMBOL":
        case "EXPONENT":
        case "ANNOTATION": {
          const n1 = n as PointNotationAttributes;
          if (!firstRow) firstRow = n1.row;
          if (!firstCol) firstCol = n1.col;

          n1.col = selectedCell.col + n1.col - firstCol;
          n1.row = selectedCell.row + n1.row - firstRow;
          notationMutationHelper.cloneNotation(n1);
          break;
        }

        case "HORIZONTALLINE": {
          let n1 = { ...n } as HorizontalLineNotationAttributes;
          const lineWidth = n1.p2x - n1.p1x;
          n1.p1x = selectedCell.col * cellStore.getCellHorizontalWidth();
          n1.p2x = n1.p1x + lineWidth;
          n1.py = selectedCell.row * cellStore.getCellVerticalHeight();
          notationMutationHelper.cloneNotation(n1);
          break;
        }

        case "SQRT": {
          let n1 = { ...n } as SqrtNotationAttributes;
          const numCols = n1.toCol - n1.fromCol;
          n1.fromCol = selectedCell.col;
          n1.toCol = n1.fromCol + numCols;
          n1.row = selectedCell.row;
          notationMutationHelper.cloneNotation(n1);
          break;
        }

        case "VERTICALLINE": {
          let n1 = { ...n } as VerticalLineNotationAttributes;
          const lineHeight = n1.p2y - n1.p1y;
          n1.p1y = selectedCell.row * cellStore.getCellVerticalHeight();
          n1.p2y = n1.p1y + lineHeight;
          n1.px = selectedCell.col * cellStore.getCellHorizontalWidth();
          notationMutationHelper.cloneNotation(n1);
          break;
        }

        case "SLOPELINE": {
          let n1 = { ...n } as SlopeLineNotationAttributes;
          const lineWidth = n1.p2x - n1.p1x;
          const lineHeight = n1.p2y - n1.p1y;
          n1.p1x = selectedCell.col * cellStore.getCellHorizontalWidth();
          n1.p2x = n1.p1x + lineWidth;
          n1.p1y = selectedCell.row * cellStore.getCellVerticalHeight();
          n1.p2y = n1.p1y + lineHeight;
          notationMutationHelper.cloneNotation(n1);
          break;
        }

        case "IMAGE":
        case "TEXT": {
          let n1 = { ...n } as RectNotationAttributes;
          const rectWidth = n1.toCol - n1.fromCol;
          const rectHeight = n1.toRow - n1.fromRow;
          if (!firstRow) firstRow = n1.fromRow;
          if (!firstCol) firstCol = n1.fromCol;

          n1.fromCol = selectedCell.col + n1.fromCol - firstCol;
          n1.toCol = n1.fromCol + rectWidth;
          n1.fromRow = selectedCell.row + n1.fromRow - firstRow;
          n1.toRow = n1.fromRow + rectHeight;
          notationMutationHelper.cloneNotation(n1);

          break;
        }

        case "CURVE": {
          let n1 = { ...n } as CurveNotationAttributes;

          const deltaX =
            selectedCell.col * cellStore.getCellHorizontalWidth() - n1.p1x;

          const deltaY =
            selectedCell.row * cellStore.getCellVerticalHeight() - n1.p1y;

          n1.p1x += deltaX;
          n1.p2x += deltaX;
          n1.p1y += deltaY;
          n1.p2y += deltaY;

          notationMutationHelper.cloneNotation(n1);
          break;
        }
      }
    });

    notationStore.clearCopiedNotations();
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
            const base64: string = await convertBlobToBase64(blob);
            await processImage(base64);
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
                  : await fetchImageAsBase64(src);
                await processImage(base64);
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
              const base64: string = await convertBlobToBase64(blob);
              await processImage(base64);
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
              : await fetchImageAsBase64(src);
            await processImage(base64);
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

  // Helper function to process the image
  async function processImage(base64: string): Promise<void> {
    const image: HTMLImageElement = new Image();
    return new Promise<void>((resolve, reject) => {
      image.onload = () => {
        const selectedCell: CellAttributes | null = cellStore.getSelectedCell();
        if (!selectedCell) {
          reject(new Error("No selected cell"));
          return;
        }
        const { col: fromCol, row: fromRow } = selectedCell;
        const toCol: number =
          Math.ceil(image.width / cellStore.getCellHorizontalWidth()) + fromCol;
        const toRow: number =
          Math.ceil(image.height / cellStore.getCellVerticalHeight()) + fromRow;

        notationMutationHelper.addImageNotation(
          fromCol,
          toCol,
          fromRow,
          toRow,
          base64,
        );
        resolve();
      };
      image.onerror = () => {
        console.error("Error loading image from base64");
        reject(new Error("Failed to load image"));
      };
      image.src = base64;
    });
  }

  // Fetch image from URL and convert to Base64
  async function fetchImageAsBase64(url: string): Promise<string> {
    try {
      const response: Response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const blob: Blob = await response.blob();
      return await convertBlobToBase64(blob);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Failed to fetch image:", error.message);
      throw error;
    }
  }

  function emitSvgMouseDown(e: MouseEvent) {
    eventBus.emit("EV_SVG_MOUSEDOWN", e);
  }

  function registerSvgMouseDown() {
    document
      ?.getElementById(cellStore.getSvgId()!)
      ?.addEventListener("mousedown", emitSvgMouseDown);
  }

  function unregisterSvgMouseDown() {
    document
      ?.getElementById(cellStore.getSvgId()!)
      ?.removeEventListener("mousedown", emitSvgMouseDown);
  }

  function registerSvgMouseMove() {
    document
      ?.getElementById(cellStore.getSvgId()!)
      ?.addEventListener("mousemove", emitSvgMouseMove);
  }

  function unregisterSvgMouseMove() {
    document
      ?.getElementById(cellStore.getSvgId()!)
      ?.removeEventListener("mousemove", emitSvgMouseMove);
  }

  function emitSvgMouseMove(e: MouseEvent) {
    eventBus.emit("EV_SVG_MOUSEMOVE", e);
  }

  function emitSvgMouseUp(e: MouseEvent) {
    eventBus.emit("EV_SVG_MOUSEUP", e);
  }

  function emitMouseUp(e: MouseEvent) {
    eventBus.emit("EV_MOUSEUP", e);
  }

  function registerSvgMouseUp() {
    document
      ?.getElementById(cellStore.getSvgId()!)
      ?.addEventListener("mouseup", emitSvgMouseUp);
  }

  function unregisterSvgMouseUp() {
    document
      ?.getElementById(cellStore.getSvgId()!)
      ?.removeEventListener("mouseup", emitSvgMouseUp);
  }

  function registerMouseUp() {
    document.addEventListener("mouseup", emitMouseUp);
  }

  function unregisterMouseUp() {
    document.removeEventListener("mouseup", emitMouseUp);
  }

  function emitKeyUp(key: KeyboardEvent) {
    eventBus.emit("EV_KEYUP", key);
  }

  function registerKeyUp() {
    window.addEventListener("keyup", emitKeyUp);
  }

  function unregisterKeyUp() {
    window.removeEventListener("keyup", emitKeyUp);
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

  async function convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  return {
    copy,
    paste,
    registerSvgMouseDown,
    unregisterSvgMouseDown,
    registerSvgMouseMove,
    unregisterSvgMouseMove,
    registerMouseUp,
    unregisterMouseUp,
    registerSvgMouseUp,
    unregisterSvgMouseUp,
    registerKeyUp,
    unregisterKeyUp,
    registerPaste,
    unregisterPaste,
    registerCopy,
    unregisterCopy,
  };
}
