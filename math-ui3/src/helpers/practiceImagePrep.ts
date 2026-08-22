/** Gemini treats images with both sides ≤ 384px as one tile; thin strips just over that get sliced badly. */
export const TUTOR_TARGET_SHORT_SIDE = 512;
export const TUTOR_MAX_LONG_SIDE = 1536;
export const TUTOR_MAX_ASPECT = 2.4;
export const TUTOR_PAD_PX = 24;

export type TutorImageLayout = {
  canvasW: number;
  canvasH: number;
  drawW: number;
  drawH: number;
  offsetX: number;
  offsetY: number;
};

export function pixelLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** True for dark-mode screenshots (light glyphs on a dark field). */
export function isMostlyDarkRgba(
  rgba: ArrayLike<number>,
  options?: { darkLum?: number; meanMax?: number; darkFraction?: number },
): boolean {
  const darkLum = options?.darkLum ?? 80;
  const meanMax = options?.meanMax ?? 110;
  const darkFraction = options?.darkFraction ?? 0.45;
  const pixelCount = Math.floor(rgba.length / 4);
  if (pixelCount === 0) return false;

  const step = Math.max(1, Math.floor(pixelCount / 5000));
  let n = 0;
  let sum = 0;
  let dark = 0;
  for (let p = 0; p < pixelCount; p += step) {
    const i = p * 4;
    const lum = pixelLuminance(rgba[i], rgba[i + 1], rgba[i + 2]);
    sum += lum;
    n += 1;
    if (lum < darkLum) dark += 1;
  }
  return sum / n < meanMax && dark / n >= darkFraction;
}

export function invertRgba(rgba: Uint8ClampedArray | number[]): void {
  for (let i = 0; i < rgba.length; i += 4) {
    rgba[i] = 255 - rgba[i];
    rgba[i + 1] = 255 - rgba[i + 1];
    rgba[i + 2] = 255 - rgba[i + 2];
  }
}

/**
 * Upscale tiny text and pad extreme aspect ratios so Gemini does not
 * tile a 100px-tall strip into unreadable slices.
 */
export function computeTutorImageLayout(
  width: number,
  height: number,
): TutorImageLayout {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const shortSide = Math.min(w, h);
  const longSide = Math.max(w, h);

  let scale = 1;
  if (shortSide < TUTOR_TARGET_SHORT_SIDE) {
    scale = TUTOR_TARGET_SHORT_SIDE / shortSide;
  }
  if (longSide * scale > TUTOR_MAX_LONG_SIDE) {
    scale = TUTOR_MAX_LONG_SIDE / longSide;
  }

  const drawW = Math.max(1, Math.round(w * scale));
  const drawH = Math.max(1, Math.round(h * scale));
  let canvasW = drawW + TUTOR_PAD_PX * 2;
  let canvasH = drawH + TUTOR_PAD_PX * 2;
  const aspect = canvasW / canvasH;
  if (aspect > TUTOR_MAX_ASPECT) {
    canvasH = Math.max(canvasH, Math.round(canvasW / TUTOR_MAX_ASPECT));
  } else if (aspect < 1 / TUTOR_MAX_ASPECT) {
    canvasW = Math.max(canvasW, Math.round(canvasH / TUTOR_MAX_ASPECT));
  }

  return {
    canvasW,
    canvasH,
    drawW,
    drawH,
    offsetX: Math.round((canvasW - drawW) / 2),
    offsetY: Math.round((canvasH - drawH) / 2),
  };
}

export const PRACTICE_IMAGE_UNREADABLE_TIP =
  "I couldn't read that image clearly. Paste the question as text (Ctrl+V), or use a larger photo with dark writing on a light background.";

export const PRACTICE_IMAGE_MISREAD_TIP =
  "I may have misread the worksheet. Paste the question as text (Ctrl+V) so I can follow the actual problem.";

export function isPracticeImageReadTip(tip: string): boolean {
  const lower = tip.toLowerCase();
  return (
    lower.includes("couldn't read") ||
    lower.includes("could not read") ||
    lower.includes("misread the worksheet")
  );
}
