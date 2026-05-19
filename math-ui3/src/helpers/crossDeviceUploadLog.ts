import useApiHelper from "./apiHelper";

const PREFIX = "[CrossDeviceUpload]";

export type CrossDeviceUploadSide = "mobile" | "desktop";

/**
 * Logs cross-device upload issues to the console and server log endpoint.
 */
export async function logCrossDeviceUpload(
  side: CrossDeviceUploadSide,
  situation: string,
  detail?: Record<string, unknown> | string,
): Promise<void> {
  const detailText =
    detail === undefined
      ? ""
      : typeof detail === "string"
        ? detail
        : JSON.stringify(detail);
  const message = detailText
    ? `${PREFIX}[${side}] ${situation}: ${detailText}`
    : `${PREFIX}[${side}] ${situation}`;

  console.warn(message);

  try {
    const { log } = useApiHelper();
    await log(message);
  } catch {
    // Logging must not break the upload flow.
  }
}

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutMessage: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export function extractImageLoadedPayload(data: unknown): {
  base64?: string;
  lessonUUId?: string;
} {
  if (!data || typeof data !== "object") {
    return {};
  }
  const record = data as Record<string, unknown>;
  if (typeof record.base64 === "string") {
    return {
      base64: record.base64,
      lessonUUId:
        typeof record.lessonUUId === "string" ? record.lessonUUId : undefined,
    };
  }
  for (const key of ["result", "data"] as const) {
    const nested = record[key];
    if (nested && typeof nested === "object") {
      const nestedRecord = nested as Record<string, unknown>;
      if (typeof nestedRecord.base64 === "string") {
        return {
          base64: nestedRecord.base64,
          lessonUUId:
            typeof nestedRecord.lessonUUId === "string"
              ? nestedRecord.lessonUUId
              : undefined,
        };
      }
    }
  }
  return {};
}

export function isValidUploadSessionId(value: string | undefined | null): boolean {
  if (!value || typeof value !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}
