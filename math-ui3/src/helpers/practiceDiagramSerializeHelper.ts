import type {
  AnnotationNotationAttributes,
  CircleNotationAttributes,
  CurveNotationAttributes,
  FreeSketchNotationAttributes,
  LineNotationAttributes,
  NotationAttributes,
  PointNotationAttributes,
} from "common/baseTypes";

export type DiagramSerializeOptions = {
  cellW: number;
  cellH: number;
};

export type DiagramSerializeResult = {
  lines: string[];
  consumedUuids: Set<string>;
};

type Pt = { x: number; y: number };

type LabelKind = "angle" | "name";

type Label = {
  uuid: string;
  text: string;
  at: Pt;
  kind: LabelKind;
};

type Seg = {
  id: number;
  a: Pt;
  b: Pt;
  length: number;
  v1: number;
  v2: number;
};

type Shape = {
  vertexIds: number[];
  closed: boolean;
};

const ANGLE_LIKE =
  /[∠∟⊥θθαβγφϕ°]|^\s*90\s*$|right\s*angle|degrees?/i;

function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function mid(a: Pt, b: Pt): Pt {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function isFinitePt(p: Pt): boolean {
  return Number.isFinite(p.x) && Number.isFinite(p.y);
}

function unit(from: Pt, to: Pt): Pt | null {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) return null;
  return { x: dx / len, y: dy / len };
}

function angleDeg(prev: Pt, curr: Pt, next: Pt): number | null {
  const u = unit(curr, prev);
  const v = unit(curr, next);
  if (!u || !v) return null;
  const dot = Math.min(1, Math.max(-1, u.x * v.x + u.y * v.y));
  return (Math.acos(dot) * 180) / Math.PI;
}

function isRightAngle(deg: number | null): boolean {
  return deg != null && Math.abs(deg - 90) <= 12;
}

function isAngleLabel(text: string): boolean {
  return ANGLE_LIKE.test(text.trim());
}

function isolatedSymbolUuids(symbols: PointNotationAttributes[]): Set<string> {
  const byRow = new Map<number, PointNotationAttributes[]>();
  for (const s of symbols) {
    if (typeof s.row !== "number" || typeof s.col !== "number") continue;
    const row = byRow.get(s.row) ?? [];
    row.push(s);
    byRow.set(s.row, row);
  }
  const isolated = new Set<string>();
  for (const row of Array.from(byRow.values())) {
    row.sort((a, b) => a.col - b.col);
    const clustered = new Set<string>();
    for (let i = 0; i < row.length; i++) {
      const prevAdj = i > 0 && row[i].col - row[i - 1].col <= 1;
      const nextAdj = i < row.length - 1 && row[i + 1].col - row[i].col <= 1;
      if (prevAdj || nextAdj) clustered.add(row[i].uuid);
    }
    const clusterSize = clustered.size;
    for (const s of row) {
      if (clusterSize >= 3 && clustered.has(s.uuid)) continue;
      isolated.add(s.uuid);
    }
  }
  return isolated;
}

function collectLabels(
  notations: NotationAttributes[],
  cellW: number,
  cellH: number,
): Label[] {
  const symbols = notations.filter(
    (n) => n.notationType === "SYMBOL",
  ) as PointNotationAttributes[];
  const isolated = isolatedSymbolUuids(symbols);
  const labels: Label[] = [];

  for (const s of symbols) {
    const text = s.value?.trim() ?? "";
    if (!text || !isolated.has(s.uuid)) continue;
    if (typeof s.col !== "number" || typeof s.row !== "number") continue;
    labels.push({
      uuid: s.uuid,
      text,
      at: { x: (s.col + 0.5) * cellW, y: (s.row + 0.5) * cellH },
      kind: isAngleLabel(text) ? "angle" : "name",
    });
  }

  for (const n of notations) {
    if (n.notationType !== "ANNOTATION") continue;
    const a = n as AnnotationNotationAttributes;
    const text = a.value?.trim() ?? "";
    if (!text || !Number.isFinite(a.x) || !Number.isFinite(a.y)) continue;
    labels.push({
      uuid: a.uuid,
      text,
      at: { x: a.x, y: a.y },
      kind: isAngleLabel(text) ? "angle" : "name",
    });
  }

  return labels;
}

function collectSegments(notations: NotationAttributes[]): Omit<
  Seg,
  "v1" | "v2"
>[] {
  const segs: Omit<Seg, "v1" | "v2">[] = [];
  let id = 0;
  for (const n of notations) {
    if (n.notationType !== "LINE") continue;
    const line = n as LineNotationAttributes;
    const a = { x: line.p1x, y: line.p1y };
    const b = { x: line.p2x, y: line.p2y };
    if (!isFinitePt(a) || !isFinitePt(b)) continue;
    const length = dist(a, b);
    if (length < 2) continue;
    segs.push({ id: id++, a, b, length });
  }
  return segs;
}

function snapVertices(
  segs: Omit<Seg, "v1" | "v2">[],
  snapRadius: number,
): { vertices: Pt[]; segs: Seg[] } {
  const vertices: Pt[] = [];
  const snap = (p: Pt): number => {
    let best = -1;
    let bestD = snapRadius;
    for (let i = 0; i < vertices.length; i++) {
      const d = dist(p, vertices[i]);
      if (d <= bestD) {
        best = i;
        bestD = d;
      }
    }
    if (best >= 0) return best;
    vertices.push({ ...p });
    return vertices.length - 1;
  };

  const snapped: Seg[] = [];
  for (const s of segs) {
    const v1 = snap(s.a);
    const v2 = snap(s.b);
    if (v1 === v2) continue;
    snapped.push({ ...s, v1, v2 });
  }
  return { vertices, segs: snapped };
}

function splitMarks(
  segs: Seg[],
  cellW: number,
): { sides: Seg[]; marks: Seg[] } {
  if (segs.length === 0) return { sides: [], marks: [] };
  const lengths = segs.map((s) => s.length).sort((a, b) => a - b);
  const median = lengths[Math.floor(lengths.length / 2)];
  const markMax = Math.max(2.2 * cellW, 0.28 * median);
  const marks = segs.filter((s) => s.length < markMax && s.length < 3.2 * cellW);
  const sides = segs.filter((s) => !marks.includes(s));
  if (sides.length < 2) return { sides: segs, marks: [] };
  return { sides, marks };
}

function edgeKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function buildAdj(segs: Seg[]): Map<number, Array<{ to: number; seg: Seg }>> {
  const adj = new Map<number, Array<{ to: number; seg: Seg }>>();
  for (const s of segs) {
    const a = adj.get(s.v1) ?? [];
    a.push({ to: s.v2, seg: s });
    adj.set(s.v1, a);
    const b = adj.get(s.v2) ?? [];
    b.push({ to: s.v1, seg: s });
    adj.set(s.v2, b);
  }
  return adj;
}

function canonCycle(ids: number[]): string {
  const n = ids.length;
  let best = ids.join(",");
  const rev = [...ids].reverse();
  for (const seq of [ids, rev]) {
    for (let i = 0; i < n; i++) {
      const rot = seq.slice(i).concat(seq.slice(0, i));
      const key = rot.join(",");
      if (key < best) best = key;
    }
  }
  return best;
}

function findCycles(sides: Seg[]): number[][] {
  const adj = buildAdj(sides);
  const seen = new Set<string>();
  const cycles: number[][] = [];

  const dfs = (
    start: number,
    current: number,
    path: number[],
    used: Set<string>,
  ) => {
    if (path.length > 8) return;
    for (const { to } of adj.get(current) ?? []) {
      const ek = edgeKey(current, to);
      if (used.has(ek)) continue;
      if (to === start && path.length >= 3) {
        const key = canonCycle(path);
        if (!seen.has(key)) {
          seen.add(key);
          cycles.push([...path]);
        }
        continue;
      }
      if (path.includes(to)) continue;
      used.add(ek);
      path.push(to);
      dfs(start, to, path, used);
      path.pop();
      used.delete(ek);
    }
  };

  for (const v of Array.from(adj.keys())) {
    dfs(v, v, [v], new Set());
  }
  return cycles;
}

function findChains(sides: Seg[], usedEdges: Set<string>): number[][] {
  const remaining = sides.filter((s) => !usedEdges.has(edgeKey(s.v1, s.v2)));
  if (remaining.length === 0) return [];
  const adj = buildAdj(remaining);
  const visitedEdges = new Set<string>();
  const chains: number[][] = [];

  const walk = (start: number, firstTo: number, firstSeg: Seg): number[] => {
    const path = [start, firstTo];
    visitedEdges.add(edgeKey(start, firstTo));
    let prev = start;
    let curr = firstTo;
    while (true) {
      const next = (adj.get(curr) ?? []).find(
        ({ to, seg }) =>
          to !== prev && !visitedEdges.has(edgeKey(seg.v1, seg.v2)),
      );
      if (!next) break;
      visitedEdges.add(edgeKey(next.seg.v1, next.seg.v2));
      path.push(next.to);
      prev = curr;
      curr = next.to;
      if (path.length > 12) break;
    }
    return path;
  };

  const starts: number[] = [];
  for (const [v, nbrs] of Array.from(adj.entries())) {
    if (nbrs.length === 1) starts.push(v);
  }
  if (starts.length === 0) {
    starts.push(...Array.from(adj.keys()));
  }

  for (const v of starts) {
    for (const { to, seg } of adj.get(v) ?? []) {
      if (visitedEdges.has(edgeKey(seg.v1, seg.v2))) continue;
      chains.push(walk(v, to, seg));
    }
  }
  return chains.filter((c) => c.length >= 2);
}

function closeNearlyClosed(
  chains: number[][],
  vertices: Pt[],
  snapRadius: number,
): { closed: number[][]; open: number[][] } {
  const closed: number[][] = [];
  const open: number[][] = [];
  const limit = snapRadius * 2.6;
  for (const chain of chains) {
    if (chain.length >= 4) {
      const a = vertices[chain[0]];
      const b = vertices[chain[chain.length - 1]];
      if (a && b && dist(a, b) <= limit) {
        closed.push(chain.slice(0, -1));
        continue;
      }
    }
    open.push(chain);
  }
  return { closed, open };
}

function shapeName(shape: Shape, rightCount: number): string {
  const n = shape.vertexIds.length;
  if (shape.closed) {
    if (n === 3) return rightCount > 0 ? "closed right triangle" : "closed triangle";
    if (n === 4) return rightCount >= 3 ? "rectangle" : "quadrilateral";
    return `closed ${n}-gon`;
  }
  if (n === 2) return "line segment";
  if (n === 3) return "2 segments meeting at a vertex";
  return `open polyline (${n - 1} sides)`;
}

function nearestIndex(at: Pt, pts: Pt[]): { i: number; d: number } {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const d = dist(at, pts[i]);
    if (d < bestD) {
      best = i;
      bestD = d;
    }
  }
  return { i: best, d: bestD };
}

function formatAngleLine(
  name: string | undefined,
  angleLabel: string | undefined,
  rightMark: boolean,
  deg: number | null,
): string {
  const at = name ? ` at ${name}` : "";
  if (angleLabel && isRightAngle(deg)) {
    return `labeled ${angleLabel}${at} (inferred right angle)`;
  }
  if (angleLabel) return `labeled ${angleLabel}${at}`;
  if (rightMark && isRightAngle(deg)) {
    return `right-angle mark${at} (inferred right angle)`;
  }
  if (rightMark) return `right-angle mark${at}`;
  if (isRightAngle(deg)) return `inferred right angle${at}`;
  if (deg != null) return `unlabeled${at} (figure ~${Math.round(deg)}°)`;
  return `unlabeled${at}`;
}

function describeShape(
  shape: Shape,
  vertices: Pt[],
  marks: Seg[],
  labels: Label[],
  consumed: Set<string>,
  cellSize: number,
): string[] {
  const ids = shape.vertexIds;
  const pts = ids.map((id) => vertices[id]);
  const n = ids.length;
  const vertexR = 2.1 * cellSize;
  const sideR = 2.6 * cellSize;

  const sideMids: Pt[] = [];
  const edgeCount = shape.closed ? n : n - 1;
  for (let i = 0; i < edgeCount; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    sideMids.push(mid(a, b));
  }

  const degs: Array<number | null> = ids.map((_, i) => {
    if (!shape.closed && (i === 0 || i === n - 1) && n !== 3) return null;
    const prev = pts[(i - 1 + n) % n];
    const next = pts[(i + 1) % n];
    if (!shape.closed && n === 3 && i !== 1) return null;
    return angleDeg(prev, pts[i], next);
  });

  const rightMarks = new Set<number>();
  for (const m of marks) {
    const u = unit(m.a, m.b);
    if (!u) continue;
    for (const other of marks) {
      if (other.id <= m.id) continue;
      const shares = [m.v1, m.v2].some((v) => v === other.v1 || v === other.v2);
      if (!shares) continue;
      const v = unit(other.a, other.b);
      if (!v) continue;
      const dot = Math.abs(u.x * v.x + u.y * v.y);
      if (dot > 0.25) continue;
      const markAt = [m.v1, m.v2, other.v1, other.v2]
        .map((vid) => vertices[vid])
        .reduce((best, p) => {
          const d = Math.min(...pts.map((q) => dist(p, q)));
          return d < best.d ? { p, d } : best;
        }, { p: vertices[m.v1], d: Infinity });
      const near = nearestIndex(markAt.p, pts);
      if (near.d <= vertexR * 1.4) rightMarks.add(near.i);
    }
    const nearA = nearestIndex(mid(m.a, m.b), pts);
    if (nearA.d <= vertexR && isRightAngle(degs[nearA.i])) {
      rightMarks.add(nearA.i);
    }
  }

  const vertexNames: Array<string | undefined> = Array(n).fill(undefined);
  const angleLabels: Array<string | undefined> = Array(n).fill(undefined);
  const sideLabels: Array<string | undefined> = Array(sideMids.length).fill(
    undefined,
  );

  const available = labels.filter((l) => !consumed.has(l.uuid));
  const take = (label: Label, slot: { set: (t: string) => void }) => {
    if (consumed.has(label.uuid)) return;
    consumed.add(label.uuid);
    slot.set(label.text);
  };

  for (const label of available.filter((l) => l.kind === "angle")) {
    const { i, d } = nearestIndex(label.at, pts);
    if (d > vertexR * 1.3) continue;
    if (angleLabels[i]) continue;
    take(label, { set: (t) => (angleLabels[i] = t) });
  }

  for (const label of available.filter((l) => l.kind !== "angle")) {
    if (consumed.has(label.uuid)) continue;
    const v = nearestIndex(label.at, pts);
    const s = nearestIndex(label.at, sideMids);
    const nearerVertex = v.d <= s.d * 0.85 || v.d <= vertexR * 0.55;
    if (nearerVertex && v.d <= vertexR && !vertexNames[v.i]) {
      take(label, { set: (t) => (vertexNames[v.i] = t) });
      continue;
    }
    if (s.d <= sideR && !sideLabels[s.i]) {
      take(label, { set: (t) => (sideLabels[s.i] = t) });
    }
  }

  const rightCount = degs.filter((d, i) => isRightAngle(d) || rightMarks.has(i))
    .length;
  const title = shapeName(shape, rightCount);
  const out: string[] = [`diagram: ${title}`];

  const sideBits = sideLabels.map((t) => t || "unlabeled");
  if (sideBits.some((t) => t !== "unlabeled") || sideBits.length >= 3) {
    out.push(`sides: ${sideBits.join("; ")}`);
  }

  const named = vertexNames.filter(Boolean);
  if (named.length) {
    out.push(`vertices: ${vertexNames.map((t) => t || "?").join("; ")}`);
  }

  const angleBits: string[] = [];
  for (let i = 0; i < n; i++) {
    if (!shape.closed && n === 3 && i !== 1) continue;
    if (!shape.closed && n !== 3 && (i === 0 || i === n - 1)) continue;
    if (degs[i] == null && !angleLabels[i] && !rightMarks.has(i) && !vertexNames[i]) {
      continue;
    }
    angleBits.push(
      formatAngleLine(
        vertexNames[i],
        angleLabels[i],
        rightMarks.has(i),
        degs[i],
      ),
    );
  }
  if (angleBits.length) out.push(`angles: ${angleBits.join("; ")}`);
  return out;
}

function attachCurveArcs(
  notations: NotationAttributes[],
  vertices: Pt[],
  cellSize: number,
): string[] {
  const arcs: string[] = [];
  for (const n of notations) {
    if (n.notationType !== "CURVE") continue;
    const c = n as CurveNotationAttributes;
    const midPt = { x: (c.p1x + c.p2x) / 2, y: (c.p1y + c.p2y) / 2 };
    if (vertices.length === 0) {
      arcs.push("curve");
      continue;
    }
    const { d } = nearestIndex(midPt, vertices);
    if (d <= 2.4 * cellSize) arcs.push("angle arc near a vertex");
    else arcs.push("curve");
  }
  return arcs;
}

function describeFreehand(
  notations: NotationAttributes[],
  labels: Label[],
  consumed: Set<string>,
): string[] {
  const sketches = notations.filter((n) => n.notationType === "FREESKETCH");
  if (sketches.length === 0) return [];
  const out = [
    sketches.length === 1
      ? "[freehand sketch]"
      : `[${sketches.length} freehand sketches]`,
  ];
  const angleBits: string[] = [];
  const otherBits: string[] = [];
  for (const label of labels) {
    if (consumed.has(label.uuid)) continue;
    let near = false;
    for (const n of sketches) {
      const s = n as FreeSketchNotationAttributes;
      const pts = s.points ?? [];
      if (pts.some((p) => dist(label.at, p) < 56)) {
        near = true;
        break;
      }
    }
    if (!near) continue;
    consumed.add(label.uuid);
    if (label.kind === "angle") angleBits.push(label.text);
    else otherBits.push(label.text);
  }
  if (otherBits.length) out.push(`labels near sketch: ${otherBits.join("; ")}`);
  if (angleBits.length) out.push(`angle labels: ${angleBits.join("; ")}`);
  return out;
}

/**
 * Turn LINE/CIRCLE/CURVE/FREESKETCH notations into tutor-facing tokens
 * (shape, side labels, inferred/labeled angles) instead of "[diagram]".
 */
export function serializePracticeDiagram(
  notations: NotationAttributes[],
  options: DiagramSerializeOptions,
): DiagramSerializeResult {
  const cellW = options.cellW > 0 ? options.cellW : 16.5;
  const cellH = options.cellH > 0 ? options.cellH : 33;
  const cellSize = Math.max(cellW, cellH * 0.5);
  const consumed = new Set<string>();
  const labels = collectLabels(notations, cellW, cellH);
  const lines: string[] = [];

  const rawSegs = collectSegments(notations);
  const { vertices, segs } = snapVertices(
    rawSegs,
    Math.max(16, 0.85 * cellW),
  );
  const { sides, marks } = splitMarks(segs, cellW);
  const cycles = findCycles(sides);
  const usedEdges = new Set<string>();
  for (const cycle of cycles) {
    for (let i = 0; i < cycle.length; i++) {
      usedEdges.add(edgeKey(cycle[i], cycle[(i + 1) % cycle.length]));
    }
  }
  const { closed: extraClosed, open } = closeNearlyClosed(
    findChains(sides, usedEdges),
    vertices,
    Math.max(16, 0.85 * cellW),
  );

  const shapes: Shape[] = [
    ...cycles.map((vertexIds) => ({ vertexIds, closed: true })),
    ...extraClosed.map((vertexIds) => ({ vertexIds, closed: true })),
    ...open.map((vertexIds) => ({ vertexIds, closed: false })),
  ];

  if (shapes.length === 0 && sides.length === 1) {
    const s = sides[0];
    shapes.push({ vertexIds: [s.v1, s.v2], closed: false });
  }

  for (const shape of shapes) {
    lines.push(
      ...describeShape(shape, vertices, marks, labels, consumed, cellSize),
    );
  }

  const circles = notations.filter((n) => n.notationType === "CIRCLE");
  if (circles.length === 1) {
    const c = circles[0] as CircleNotationAttributes;
    const r = Number.isFinite(c.r) ? ` (r≈${Math.round(c.r)})` : "";
    lines.push(`diagram: circle${r}`);
  } else if (circles.length > 1) {
    lines.push(`diagram: ${circles.length} circles`);
  }

  const curveBits = attachCurveArcs(notations, vertices, cellSize);
  if (curveBits.length === 1 && curveBits[0] === "curve") {
    lines.push("diagram: curve");
  } else if (curveBits.length) {
    lines.push(`diagram extras: ${curveBits.join("; ")}`);
  }

  const poly = notations.filter((n) => n.notationType === "POLYGON");
  if (poly.length && shapes.length === 0) {
    lines.push("[diagram]");
  }

  lines.push(...describeFreehand(notations, labels, consumed));

  if (
    lines.length === 0 &&
    notations.some(
      (n) =>
        n.notationType === "LINE" ||
        n.notationType === "CURVE" ||
        n.notationType === "CIRCLE" ||
        n.notationType === "POLYGON",
    )
  ) {
    lines.push("[diagram]");
  }

  return { lines, consumedUuids: consumed };
}

export type FractionInsert = {
  row: number;
  col: number;
  text: string;
};

function pointToken(n: PointNotationAttributes): string {
  const value = n.value ?? "";
  if (n.notationType === "EXPONENT") return "^" + value;
  if (n.notationType === "LOGBASE") return "_" + value;
  return value;
}

function concatPoints(points: PointNotationAttributes[]): string {
  return [...points]
    .sort((a, b) => a.col - b.col)
    .map(pointToken)
    .join("");
}

/**
 * Turn DIVISIONLINE + nearby symbols into (num)/(den) tokens for the tutor.
 */
export function serializePracticeFractions(
  notations: NotationAttributes[],
  options: DiagramSerializeOptions,
): { consumedUuids: Set<string>; inserts: FractionInsert[] } {
  const cellW = options.cellW > 0 ? options.cellW : 16.5;
  const cellH = options.cellH > 0 ? options.cellH : 33;
  const consumed = new Set<string>();
  const inserts: FractionInsert[] = [];

  const points = notations.filter(
    (n) =>
      n.notationType === "SYMBOL" ||
      n.notationType === "EXPONENT" ||
      n.notationType === "LOGBASE",
  ) as PointNotationAttributes[];

  const inBand = (row: number, fromCol: number, toCol: number) =>
    points.filter(
      (p) =>
        !consumed.has(p.uuid) &&
        typeof p.row === "number" &&
        typeof p.col === "number" &&
        p.row === row &&
        p.col >= fromCol &&
        p.col <= toCol,
    );

  for (const n of notations) {
    if (n.notationType !== "DIVISIONLINE") continue;
    const line = n as LineNotationAttributes;
    if (!Number.isFinite(line.p1x) || !Number.isFinite(line.p1y)) continue;

    const x1 = Math.min(line.p1x, line.p2x);
    const x2 = Math.max(line.p1x, line.p2x);
    const y = (line.p1y + line.p2y) / 2;
    const fromCol = Math.floor(x1 / cellW);
    const toCol = Math.max(fromCol, Math.floor((x2 - 1) / cellW));
    const denRow = Math.floor(y / cellH);
    const numRow = denRow - 1;

    let num = inBand(numRow, fromCol, toCol);
    let den = inBand(denRow, fromCol, toCol);
    if (num.length === 0) num = inBand(numRow - 1, fromCol, toCol);
    if (den.length === 0) den = inBand(denRow + 1, fromCol, toCol);

    const numText = concatPoints(num);
    const denText = concatPoints(den);
    for (const p of num) consumed.add(p.uuid);
    for (const p of den) consumed.add(p.uuid);

    inserts.push({
      row: den.length ? den[0].row : denRow,
      col: fromCol,
      text: `(${numText || "?"})/(${denText || "?"})`,
    });
  }

  return { consumedUuids: consumed, inserts };
}
