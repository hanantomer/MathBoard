import {
  BoardType,
  NotationType,
  EditMode,
  BusEventType,
} from "./unions";
import { UserAttributes } from "./userTypes";

export type EntityAttributes = {
  id?: number;
  uuid: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type NotationAttributes =
  EntityAttributes & {
    parentUUId: string;
    user: UserAttributes;
    notationType: NotationType;
    boardType: BoardType;
    selected?: boolean;
    color?: ColorAttributes | null;
  };

export type ExponentAttributes = {
  value: string;
};

export type NotationCreationAttributes = Omit<
  NotationAttributes,
  "uuid"
>;

export type SingleValueAttributes = {
  value: string;
};

export type SymbolAttributes = {
  followsFraction: boolean;
};

export type ColorAttributes = {
  id?: number;
  value: string;
};

export type DotCoordinates = {
  x: number;
  y: number;
};

export type LineCoordinates = {
  top: DotCoordinates;
  bottom: DotCoordinates;
};

export type RectCoordinates = {
  topLeft: DotCoordinates;
  bottomRight: DotCoordinates;
};

export type CellAttributes = {
  col: number;
  row: number;
};

export type SelectedCell = CellAttributes & {
  userUUId: string;
  lessonUUId: number;
};

export type ColorizedCell = CellAttributes & {
  userUUId: string;
  lessonUUId: number;
  color: string;
};


export type LineAttributes = {
  p1x: number; // left
  p2x: number; // right
  p1y: number; // y which corresponds to x1, if the slope is positive this is the bottom(and higher) y and vice versa
  p2y: number; // y which corresponds to x2, if the slope is positive this is the top (and lower y) and vice versa
};

export type CurveAttributes = {
  p1x: number; // left
  p2x: number; // right
  p1y: number; // y which corresponds to p1x
  p2y: number; // y which corresponds to p2x
  cpx: number; // control point x
  cpy: number; // control point y
};

export type CircleAttributes = {
  cx: number; // center x
  cy: number; // center y
  r: number; // radius
};

export type RectAttributes = {
  fromCol: number;
  toCol: number;
  fromRow: number;
  toRow: number;
};

export type MultiCellAttributes = {
  fromCol: number;
  toCol: number;
  row: number;
};

export type BoardAttributes = {
  name: string;
  user: UserAttributes;
};

export type Board = {
  uuid: string;
  type: BoardType;
};

export type PointNotationAttributes =
  EntityAttributes &
    NotationAttributes &
    CellAttributes &
    SingleValueAttributes &
    SymbolAttributes;


export type LineNotationAttributes =
  EntityAttributes &
    NotationAttributes &
    LineAttributes;

export type CurveNotationAttributes =
  EntityAttributes &
    NotationAttributes &
    CurveAttributes;

export type CircleNotationAttributes =
  EntityAttributes &
    NotationAttributes &
    CircleAttributes;

export type RectNotationAttributes =
  EntityAttributes &
    NotationAttributes &
    RectAttributes &
    SingleValueAttributes;

export type AnnotationNotationAttributes =
  EntityAttributes &
    NotationAttributes &
    DotCoordinates &
    SingleValueAttributes;

export type SqrtNotationAttributes =
  EntityAttributes &
    NotationAttributes &
    MultiCellAttributes;

// ommiting uuid from creation attributed since created by the databse
export type PointNotationCreationAttributes =
  Omit<
    NotationAttributes &
      CellAttributes &
      SingleValueAttributes,
    "uuid"
  >;

export type SqrtNotationCreationAttributes = Omit<
  SqrtNotationAttributes,
  "uuid"
>;


export type LineNotationCreationAttributes = Omit<
  NotationAttributes & LineAttributes,
  "uuid"
>;
export type RectNotationCreationAttributes = Omit<
  NotationAttributes &
    RectAttributes &
    SingleValueAttributes,
  "uuid"
>;
export type CurveNotationCreationAttributes =
  Omit<
    NotationAttributes & CurveAttributes,
    "uuid"
  >;

export type CircleNotationCreationAttributes =
  Omit<
    NotationAttributes & CircleAttributes,
    "uuid"
  >;

export type ExponentNotationCreationAttributes =
  Omit<
    EntityAttributes &
      NotationAttributes &
      CellAttributes &
      ExponentAttributes,
    "uuid"
  >;
export type AnnotationNotationCreationAttributes =
  Omit<
    EntityAttributes &
      NotationAttributes &
      DotCoordinates &
      SingleValueAttributes,
    "uuid"
  >;
export type ColorCreationAttributes = Omit<
  ColorAttributes,
  "id"
>;

export function isRect(n: NotationType): boolean {
  return n === "TEXT" || n === "IMAGE";
}

export function isLine(n: NotationType): boolean {
  return (
    n === "SQRT" ||
    n === "LINE"
  );
}

export function isCurve(
  n: NotationType
): boolean {
  return n === "CURVE";
}

export function isCellNotation(
  n: NotationType
): boolean {
  return (
    n === "ANNOTATION" ||
    n === "SIGN" ||
    n === "SQRTSYMBOL" ||
    n === "EXPONENT" ||
    n === "SYMBOL"
  );
}

export function isMultiCell(
  n: NotationType
): boolean {
  return (
    n ===
    "SQRT" /*unlike horizontal line, sqrt borders adjusts to cell borders */
  );
}

export type MovementDirection =
  | "UP"
  | "DOWN"
  | "NONE";

export type SlopeType =
  | "POSITIVE"
  | "NEGATIVE"
  | "NONE";

export type lineWatcherEntry = {
  func: (p: DotCoordinates) => void;
  editMode: Array<EditMode>;
};

export type lineSaveWatcherEntry = {
  func: () => Promise<string>;
  editMode: Array<EditMode>;
};

export type lineMoveWatcherEntry = {
  func: (moveX: number, moveY: number) => void;
  editMode: Array<EditMode>;
};

export type lineSelectWatcherEntry = {
  func: (notation: NotationAttributes) => void;
  editMode: Array<EditMode>;
  event: BusEventType;
};

export type lineEndSelectionWatcherEntry = {
  editMode: Array<EditMode>;
};
