
export default function imageHelper() {
  // Helper function to process the image
  async function convertBase64ToGrayScale(base64: string): Promise<string> {
    const image: HTMLImageElement = new Image();
    return new Promise<string>((resolve, reject) => {
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
        ctx.filter = "grayscale(100%)";
        ctx.drawImage(image, 0, 0);
        const grayscaleBase64 = canvas.toDataURL("image/png");

        const base64SizeBytes = Math.ceil(
          ((grayscaleBase64.length - "data:image/png;base64,".length) * 3) / 4,
        );
        if (base64SizeBytes >= 2000 * 1024) {
          //         alert(`Image ${base64SizeBytes} is too large(max- 3 mb)"`);
          //          reject(new Error("Image is too large(max- 3 mb)"));
          //          return;
        }

        resolve(grayscaleBase64);
      };
      image.onerror = () => {
        console.error("Error loading image from base64");
        reject(new Error("Failed to load image"));
      };
      image.src = base64;
    });
  }

  async function convertImageToBase64(url: string): Promise<string> {
    try {
      const response: Response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const blob: Blob = await response.blob();
      return await convertBase64ToGrayScale(await convertBlobToBase64(blob));
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

  async function convertBlobToBase64GrayScale(blob: Blob): Promise<string> {
    const base64 = await convertBlobToBase64(blob);
    return await convertBase64ToGrayScale(base64);
  }

  async function getDimensionsFromBase64(
    base64: string,
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = (err) => {
        reject(err);
      };
      img.src = base64;
    });
  }

  return {
    getDimensionsFromBase64,
    convertBlobToBase64GrayScale,
    convertImageToBase64,
  };
}
