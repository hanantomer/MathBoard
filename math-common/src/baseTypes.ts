import {
  BoardType,
  NotationType,
  EditMode,
  LineHandleType
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
    //uuid: string;
    parentUUId: string;
    user: UserAttributes;
    notationType: NotationType;
    boardType: BoardType;
    selected?: boolean;
    color?: ColorAttributes | null;
  };

export type ExponentAttributes = {
  exponent: string;
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

export type HorizontalLineAttributes = {
  p1x: number;
  p2x: number;
  py: number;
};

export type VerticalLineAttributes = {
  px: number;
  p1y: number;
  p2y: number;
};

export type SlopeLineAttributes = {
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

export type HorizontalLineNotationAttributes =
  EntityAttributes &
    NotationAttributes &
    HorizontalLineAttributes;

export type VerticalLineNotationAttributes =
  EntityAttributes &
    NotationAttributes &
    VerticalLineAttributes;

export type SlopeLineNotationAttributes =
  EntityAttributes &
    NotationAttributes &
    SlopeLineAttributes;

export type CurveNotationAttributes =
  EntityAttributes &
    NotationAttributes &
    CurveAttributes;

export type RectNotationAttributes =
  EntityAttributes &
    NotationAttributes &
    RectAttributes &
    SingleValueAttributes;

export type ExponentNotationAttributes =
  EntityAttributes &
    NotationAttributes &
    CellAttributes &
    ExponentAttributes;

export type AnnotationNotationAttributes =
  EntityAttributes &
    NotationAttributes &
    CellAttributes &
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

export type HorizontalLineNotationCreationAttributes =
  Omit<
    NotationAttributes & HorizontalLineAttributes,
    "uuid"
  >;
export type VerticalLineNotationCreationAttributes =
  Omit<
    NotationAttributes & VerticalLineAttributes,
    "uuid"
  >;
export type SlopeLineNotationCreationAttributes =
  Omit<
    NotationAttributes & SlopeLineAttributes,
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
      CellAttributes &
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
    n === "HORIZONTALLINE" ||
    n === "SQRT" ||
    n === "VERTICALLINE" ||
    n === "SLOPELINE"
  );
}

export function isCurve(
  n: NotationType
): boolean {
  return (
    n === "CONCAVECURVE" || n === "CONVEXCURVE"
  );
}

export function isPoint(
  n: NotationType
): boolean {
  return (
    n === "ANNOTATION" ||
    n === "SIGN" ||
    n === "SQRTSYMBOL" ||
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

export type SlopeDrawerAttributes = {
  linePosition: SlopeLineAttributes;
  slopeType: SlopeType;
  movementDirection: MovementDirection;
};

export type lineWatcherEntry = {
   func: (p: DotCoordinates) => void
   editMode: [EditMode]
}

// export type lineHandleWatcherEntry = {
//   func: (p: DotCoordinates) => void;
//   editMode: EditMode;
//   handleType: LineHandleType;
// };

