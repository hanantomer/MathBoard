import {
  DotCoordinates,
  LineNotationAttributes,
  NotationAttributes,
} from "common/baseTypes";

export const LINE_JUNCTION_TOLERANCE = 2;

export type LineEndpointBinding = {
  lineUuid: string;
  endpoint: "p1" | "p2";
};

export type LineJunction = {
  x: number;
  y: number;
  bindings: LineEndpointBinding[];
};

type EndpointWithCoords = LineEndpointBinding & DotCoordinates;

export function isJunctionLineNotation(notation: NotationAttributes): boolean {
  return notation.notationType === "LINE";
}

export function endpointsMatch(
  a: DotCoordinates,
  b: DotCoordinates,
  tolerance = LINE_JUNCTION_TOLERANCE,
): boolean {
  return (
    Math.abs(a.x - b.x) <= tolerance && Math.abs(a.y - b.y) <= tolerance
  );
}

export function junctionKey(junction: LineJunction): string {
  return `${junction.x},${junction.y}`;
}

function getEndpointsWithCoords(
  notations: NotationAttributes[],
): EndpointWithCoords[] {
  const endpoints: EndpointWithCoords[] = [];

  for (const notation of notations) {
    if (!isJunctionLineNotation(notation)) {
      continue;
    }

    const line = notation as LineNotationAttributes;
    endpoints.push({
      lineUuid: line.uuid,
      endpoint: "p1",
      x: line.p1x,
      y: line.p1y,
    });
    endpoints.push({
      lineUuid: line.uuid,
      endpoint: "p2",
      x: line.p2x,
      y: line.p2y,
    });
  }

  return endpoints;
}

export function findJunctions(notations: NotationAttributes[]): LineJunction[] {
  const endpoints = getEndpointsWithCoords(notations);
  const junctions: LineJunction[] = [];
  const used = new Set<string>();

  for (let i = 0; i < endpoints.length; i++) {
    const startKey = `${endpoints[i].lineUuid}:${endpoints[i].endpoint}`;
    if (used.has(startKey)) {
      continue;
    }

    const group: EndpointWithCoords[] = [endpoints[i]];
    for (let j = i + 1; j < endpoints.length; j++) {
      if (endpointsMatch(endpoints[i], endpoints[j])) {
        group.push(endpoints[j]);
      }
    }

    if (group.length < 2) {
      continue;
    }

    for (const endpoint of group) {
      used.add(`${endpoint.lineUuid}:${endpoint.endpoint}`);
    }

    junctions.push({
      x: Math.round(group.reduce((sum, g) => sum + g.x, 0) / group.length),
      y: Math.round(group.reduce((sum, g) => sum + g.y, 0) / group.length),
      bindings: group.map((g) => ({
        lineUuid: g.lineUuid,
        endpoint: g.endpoint,
      })),
    });
  }

  return junctions;
}

export function findJunctionsForLine(
  notations: NotationAttributes[],
  lineUuid: string,
): LineJunction[] {
  return findJunctions(notations).filter((junction) =>
    junction.bindings.some((binding) => binding.lineUuid === lineUuid),
  );
}

export function isEndpointInJunction(
  junctions: LineJunction[],
  lineUuid: string,
  endpoint: "p1" | "p2",
): boolean {
  return junctions.some((junction) =>
    junction.bindings.some(
      (binding) =>
        binding.lineUuid === lineUuid && binding.endpoint === endpoint,
    ),
  );
}

export function applyJunctionPoint(
  junction: LineJunction,
  point: DotCoordinates,
  getLine: (uuid: string) => LineNotationAttributes | undefined,
  applyLine: (line: LineNotationAttributes) => void,
): DotCoordinates {
  const rounded = {
    x: Math.round(point.x),
    y: Math.round(point.y),
  };
  const updatedByLine = new Map<string, LineNotationAttributes>();

  for (const binding of junction.bindings) {
    const existing = updatedByLine.get(binding.lineUuid) ?? getLine(binding.lineUuid);
    if (!existing) {
      continue;
    }

    const updated = {
      ...(updatedByLine.get(binding.lineUuid) ?? { ...existing }),
    };

    if (binding.endpoint === "p1") {
      updated.p1x = rounded.x;
      updated.p1y = rounded.y;
    } else {
      updated.p2x = rounded.x;
      updated.p2y = rounded.y;
    }

    updatedByLine.set(binding.lineUuid, updated);
  }

  for (const updated of updatedByLine.values()) {
    applyLine(updated);
  }

  return rounded;
}

export function collectJunctionLineUuids(junction: LineJunction): string[] {
  return [...new Set(junction.bindings.map((binding) => binding.lineUuid))];
}
