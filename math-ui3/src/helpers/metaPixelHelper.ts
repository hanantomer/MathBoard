export const META_PIXEL_ID = "1329539881952315";

/** Fire Meta Pixel PageView for SPA route changes (initial load + navigations). */
export function trackMetaPixelPageView(
  path: string,
  title?: string,
): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }

  const payload: Record<string, string> = { page_path: path };
  if (title) {
    payload.page_title = title;
  }

  window.fbq("track", "PageView", payload);
}
