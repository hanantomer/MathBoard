/** Collapse clipboard quirks that show up as repeated chunks in a pasted problem. */

const MIN_REPEAT_CHUNK = 16;
const MAX_REPEAT_CHUNK = 240;

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

/** If the payload is the same block two or more times, keep one copy. */
function collapseDoubledBlock(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length < 16) return text;

  const mirrored = trimmed.match(/^([\s\S]+?)(?:\n+\1)+$/);
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
 * Word / Docs / PDF copies often glue the stem to itself on one line:
 * "In △ABC… In △ABC… In △ABC… (D) is a point…". Keep one stem.
 */
function collapseRepeatedPrefixOnLine(line: string): string {
  if (line.length < MIN_REPEAT_CHUNK * 2) return line;
  const maxLen = Math.min(MAX_REPEAT_CHUNK, Math.floor(line.length / 2));
  for (let len = maxLen; len >= MIN_REPEAT_CHUNK; len--) {
    const chunk = line.slice(0, len);
    let count = 1;
    let pos = len;
    while (pos < line.length) {
      let next = pos;
      if (line[next] === " ") next += 1;
      if (!line.startsWith(chunk, next)) break;
      count += 1;
      pos = next + len;
    }
    if (count >= 2) {
      return chunk + line.slice(pos);
    }
  }
  return line;
}

function collapseRepeatedLineStarts(text: string): string {
  return text
    .split("\n")
    .map((line) => collapseRepeatedPrefixOnLine(line))
    .join("\n");
}

/**
 * Some copies emit growing prefixes ("AB = 13" then "AB = 13 cm, BC = 14").
 * Keep the longest line in each prefix run. Drop identical consecutive lines.
 */
function collapseCumulativeLines(text: string): string {
  const lines = text.split("\n");
  const out: string[] = [];
  for (const line of lines) {
    const prev = out[out.length - 1];
    if (prev !== undefined && line && prev) {
      if (line === prev) continue;
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
  text = collapseRepeatedLineStarts(text);
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
