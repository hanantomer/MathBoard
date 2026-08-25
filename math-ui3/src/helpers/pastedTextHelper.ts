/** Collapse clipboard quirks that show up as repeated chunks in a pasted problem. */

function normalizeNewlines(raw: string): string {
  return raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** If the payload is the same block twice, keep one copy. */
function collapseDoubledBlock(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length < 16) return text;

  const mirrored = trimmed.match(/^([\s\S]+?)\n+\1$/);
  if (mirrored) return mirrored[1].trimEnd();

  const lines = trimmed.split("\n");
  if (lines.length >= 2 && lines.length % 2 === 0) {
    const half = lines.length / 2;
    const first = lines.slice(0, half).join("\n").trim();
    const second = lines.slice(half).join("\n").trim();
    if (first.length >= 8 && first === second) return first;
  }

  return text;
}

/** Drop a paragraph that is an exact repeat of the one above it. */
function collapseDuplicateParagraphs(text: string): string {
  const paras = text.split(/\n{2,}/);
  const out: string[] = [];
  for (const para of paras) {
    if (out.length > 0 && out[out.length - 1] === para) continue;
    out.push(para);
  }
  return out.join("\n\n");
}

/**
 * Some copies emit growing prefixes ("AB = 13" then "AB = 13 cm, BC = 14").
 * Keep the longest line in each prefix run.
 */
function collapseCumulativeLines(text: string): string {
  const lines = text.split("\n");
  const out: string[] = [];
  for (const line of lines) {
    const prev = out[out.length - 1];
    if (prev !== undefined && line && prev && line !== prev) {
      if (line.startsWith(prev)) {
        out[out.length - 1] = line;
        continue;
      }
      if (prev.startsWith(line)) {
        continue;
      }
    }
    out.push(line);
  }
  return out.join("\n");
}

export function escapeTextForHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function normalizePastedBoardText(
  plainText: string,
  htmlText = "",
): string {
  let text = normalizeNewlines(plainText);
  if (!text.trim() && htmlText.trim()) {
    text = htmlToPlainText(htmlText);
  }
  text = collapseDoubledBlock(text);
  text = collapseDuplicateParagraphs(text);
  text = collapseCumulativeLines(text);
  return text.replace(/\n{3,}/g, "\n\n").trimEnd();
}

export function isNativeTextFieldPaste(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag !== "INPUT" && tag !== "TEXTAREA") return false;
  // Overlay editor and lesson live-sync — let the browser paste.
  if (target.id === "textAreaEl") return true;
  if (target.classList.contains("textsync")) return true;
  // Cell symbol field should not eat a problem paste as one glyph per character.
  if (target.classList.contains("cell-symbol-input")) return false;
  return true;
}
