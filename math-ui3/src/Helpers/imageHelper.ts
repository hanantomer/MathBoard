import { useCellStore } from "../store/pinia/cellStore";
import useNotationMutationHelper from "./notationMutateHelper";
import { CellAttributes } from "common/baseTypes";

const cellStore = useCellStore();
const notationMutationHelper = useNotationMutationHelper();

export default function imageHelper() {
  // Helper function to process the image
  async function processImage(base64: string): Promise<void> {
    const image: HTMLImageElement = new Image();
    return new Promise<void>((resolve, reject) => {
      image.onload = () => {
        // Convert image to grayscale using canvas
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        ctx.drawImage(image, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < imgData.data.length; i += 4) {
          const avg = Math.round(
            (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3,
          );
          imgData.data[i] = avg; // R
          imgData.data[i + 1] = avg; // G
          imgData.data[i + 2] = avg; // B
          // Alpha remains unchanged
        }
        ctx.putImageData(imgData, 0, 0);
        const grayscaleBase64 = canvas.toDataURL();

        // Check base64 size (rough estimate)
        const base64SizeBytes = Math.ceil(
          ((grayscaleBase64.length - "data:image/png;base64,".length) * 3) / 4,
        );
        if (base64SizeBytes >= 2000 * 1024) {
          // 1 MB
          alert("Image is too large(max- 3 mb)");
          reject(new Error("Image is too large(max- 3 mb)"));
          return;
        }

        const selectedCell: CellAttributes | null = cellStore.getSelectedCell();
        if (!selectedCell) {
          reject(new Error("No selected cell"));
          return;
        }
        const { col: fromCol, row: fromRow } = selectedCell;

        // Limit image width to maximum 1000 pixels
        const displayWidth = Math.min(image.width, 1000);
        const displayHeight = image.height * (displayWidth / image.width);

        const toCol: number =
          Math.ceil(displayWidth / cellStore.getCellHorizontalWidth()) +
          fromCol;
        const toRow: number =
          Math.ceil(displayHeight / cellStore.getCellVerticalHeight()) +
          fromRow;

        notationMutationHelper.addImageNotation(
          fromCol,
          toCol,
          fromRow,
          toRow,
          grayscaleBase64,
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

  async function convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  return {
    processImage,
    fetchImageAsBase64,
  };
}
