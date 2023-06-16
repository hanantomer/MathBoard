import {
  Notation,
  PointNotation,
  LineNotation,
  RectNotation,
} from "../../Helpers/responseTypes";
import { dbSync } from "../../Helpers/dbSyncMixin";
const db = dbSync();
import { PointCoordinates, LineCoordinates, RectCoordinates, matrixDimensions } from "../../../../math-common/src/globals";
import { NotationType, NotationTypeShape, NotationShape, BoardType } from "../../../../math-common/src/enum";
import { useUserStore } from "./userStore";
import { UUID } from "sequelize";
const userStore = useUserStore();


export default function notationHelper() {
   // matrix which marks in true each occupied cell
  function createCellOccupationMatrix(): (Notation|null) [][] {
    let matrix: (Notation|null)[][] = new Array();
    for (let i = 0; i < matrixDimensions.rowsNum; i++) {
      for (let j = 0; j < matrixDimensions.colsNum; j++) {
        matrix[i][j] = null;
      }
    }
    return matrix;
  };

  // removeFromOccupationMatrix: function (
  //   matrix: any,
  //   notation: PointNotation
  // ) {
  //   matrix[notation.row][notation.col] = null;
  // },

  function removePointFromOccupationMatrix(
    matrix: any,
    pointNotation: PointNotation
  ) {
    matrix[pointNotation.row][pointNotation.col] = null;
  };

  function removeLineFromOccupationMatrix(matrix: any, line: LineNotation) {
    for (let col: number = line.fromCol; col <= line.toCol; col++) {
      matrix[line.row][col] = null;
    }
  };

  function removeRectFromOccupationMatrix (
    matrix: any,
    rect: RectCoordinates
  ) {
    for (let row = rect.fromRow; row <= rect.toRow; row++) {
      for (let col = rect.fromCol; col <= rect.toCol; col++) {
        matrix[row][col] = null;
      }
    }
  };

  function addPointToOccupationMatrix(matrix: any, notation: PointNotation) {
    matrix[notation.row][notation.col] = notation;
  };

  // addToOccupationMatrix: function (matrix: any, notation: LineNotation) {
  //   for (let col = notation.fromCol; col <= notation.toCol; col++) {
  //     matrix[notation.row][col] = notation;
  //   }
  // },

  function addRectToOccupationMatrix (matrix: any, notation: RectCoordinates) {
    for (let row = notation.fromRow; row <= notation.toRow; row++) {
      for (let col = notation.fromCol; col <= notation.toCol; col++) {
        matrix[row][col] = notation;
      }
    }
  };

  /// TODO move board type check outside
  function isCellInQuestionArea(
    boardType: BoardType,
    pointCoordinates: PointCoordinates,
    occupationMatrix: (Notation | null)[][]
  ): boolean {
    return (
      boardType == BoardType.ANSWER &&
      !userStore.isTeacher &&
      occupationMatrix.at(pointCoordinates.row)?.at(pointCoordinates.col)
        ?.boardType == BoardType.QUESTION
    );
  };

  /// TODO move board type check outside
  // return true for student in question and point coordinates are within question area
  function isNotationInQuestionArea(
    notation: Notation,
    occupationMatrix: (Notation | null)[][]
  ): boolean {
    switch (NotationTypeShape.get(notation.notationType)) {
      case NotationShape.POINT: {
        let pointNotation = notation as PointNotation;
        return (
          notation.boardType === BoardType.ANSWER &&
          !userStore.isTeacher &&
          occupationMatrix.at(pointNotation.row)?.at(pointNotation.col)
            ?.boardType == BoardType.QUESTION
        );
      }
      case NotationShape.LINE: {
        let lineNotation = notation as LineNotation;
        for (
          let i: number = lineNotation.fromCol;
          i <= lineNotation.toCol;
          i++
        ) {
          if (
            notation.boardType === BoardType.ANSWER &&
            !userStore.isTeacher &&
            occupationMatrix.at(lineNotation.row)?.at(i)?.boardType ==
              BoardType.QUESTION
          )
            return true;
        }
      }
      case NotationShape.RECT: {
        let rectNotation = notation as RectNotation;
        for (
          let i: number = rectNotation.fromCol;
          i <= rectNotation.toCol;
          i++
        ) {
          for (
            let j: number = rectNotation.fromRow;
            i <= rectNotation.toRow;
            j++
          ) {
            if (
              notation.boardType === BoardType.ANSWER &&
              !userStore.isTeacher &&
              occupationMatrix.at(j)?.at(i)?.boardType == BoardType.QUESTION
            )
              return true;
          }
        }
      }
    }
    return false;
  };

  // point
  function pointAtPointCoordinates(
    n1: PointNotation,
    n2: PointCoordinates,
    userUUId: string
  ) {
    return n1.col == n2.col && n1.row == n2.row && n1.user.uuid === userUUId;
  };

  function pointAtLineCoordinates (
    pointNotation: PointNotation,
    lineCoordinates: LineCoordinates,
    userId: number
  ) {
    return (
      pointNotation.col >= lineCoordinates.fromCol &&
      pointNotation.col <= lineCoordinates.toCol &&
      pointNotation.row == lineCoordinates.row &&
      pointNotation.userId == userId
    );
  };

  function pointAtRectCoordinates(
    pointNotation: PointNotation,
    rectCoordinates: RectCoordinates,
    userId: number
  ) {
    return (
      pointNotation.col >= rectCoordinates.fromCol &&
      pointNotation.col <= rectCoordinates.toCol &&
      pointNotation.row >= rectCoordinates.fromRow &&
      pointNotation.row <= rectCoordinates.toRow &&
      pointNotation.userId == userId
    );
  };

  // line
  function lineAtPointCoordinates (
    lineCoordinates: LineNotation,
    pointCoordinates: PointCoordinates,
    userUUId: string
  ) {
    return (
      lineCoordinates.fromCol <= pointCoordinates.col &&
      lineCoordinates.toCol >= pointCoordinates.col &&
      lineCoordinates.row == pointCoordinates.row &&
      lineCoordinates.user.uuid == userUUId
    );
  };

  function lineAtLineCoordinates (
    line1Coordinates: LineNotation,
    line2Coordinates: LineNotation,
    userId: number
  ) {
    return (
      ((line1Coordinates.fromCol >= line2Coordinates.fromCol &&
        line1Coordinates.fromCol <= line2Coordinates.toCol) ||
        (line1Coordinates.toCol >= line2Coordinates.fromCol &&
          line1Coordinates.toCol <= line2Coordinates.toCol)) &&
      line1Coordinates.row == line2Coordinates.row &&
      line1Coordinates.userId == userId
    );
  };

  function lineAtRectCoordinates (
    lineNotation: LineNotation,
    rectCoordinates: RectCoordinates,
    userId: number
  ) {
    return (
      ((lineNotation.fromCol >= rectCoordinates.fromCol &&
        lineNotation.fromCol <= rectCoordinates.toCol) ||
        (lineNotation.toCol >= rectCoordinates.fromCol &&
          lineNotation.toCol <= rectCoordinates.toCol)) &&
      lineNotation.row >= rectCoordinates.fromRow &&
      lineNotation.row <= rectCoordinates.toRow &&
      lineNotation.userId == userId
    );
  };

  // rect
  function rectAtPointCoordinates (
    rectNotation: RectNotation,
    pointCoordinates: PointCoordinates,
    userUUId: string
  ) {
    return (
      rectNotation.fromCol <= pointCoordinates.col &&
      rectNotation.toCol >= pointCoordinates.col &&
      rectNotation.fromRow <= pointCoordinates.row &&
      rectNotation.toRow >= pointCoordinates.row &&
      rectNotation.user.uuid == userUUId
    );
  };

  function rectAtLineCoordinates (
    rectNotation: RectNotation,
    lineCoordinates: LineCoordinates,
    userId: number
  ) {
    return (
      ((rectNotation.fromCol >= lineCoordinates.fromCol &&
        rectNotation.fromCol <= lineCoordinates.toCol) ||
        (rectNotation.toCol >= lineCoordinates.fromCol &&
          rectNotation.toCol <= lineCoordinates.toCol)) &&
      rectNotation.fromRow <= lineCoordinates.row &&
      rectNotation.toRow >= lineCoordinates.row &&
      rectNotation.userId == userId
    );
  };

  function rectAtRectCoordinates (
    rectNotation: RectNotation,
    rectCoordinates: RectCoordinates,
    userId: number
  ) {
    return (
      ((rectNotation.fromCol >= rectCoordinates.fromCol &&
        rectNotation.fromCol <= rectCoordinates.toCol) ||
        (rectNotation.toCol >= rectCoordinates.fromCol &&
          rectNotation.toCol <= rectCoordinates.toCol)) &&
      ((rectNotation.fromRow >= rectCoordinates.fromRow &&
        rectNotation.fromRow <= rectCoordinates.toRow) ||
        (rectNotation.toRow >= rectCoordinates.fromRow &&
          rectNotation.toRow <= rectCoordinates.toRow)) &&
      rectNotation.userId == userId
    );
  };

  // return a list of notations wich overlap given point coordinates
  function findNotationsByCellCoordinates (
    notationsMap: Map<String, Notation>,
    cellCoordinates: PointCoordinates,
    userUUId: string
  ) {
    return Object.entries(notationsMap)
      .map((n: Notation[]) => n[1])
      .filter((n: Notation) =>
        n.notationType == NotationType.SYMBOL || // maybe replace type with reflection
        n.notationType == NotationType.POWER ||
        n.notationType == NotationType.SIGN
          ? pointAtPointCoordinates(
              n as PointNotation,
              cellCoordinates,
              userUUId
            )
          : n.notationType == NotationType.FRACTION ||
            n.notationType == NotationType.SQRT
          ? lineAtPointCoordinates(n as LineNotation, cellCoordinates, userUUId)
          : n.notationType == NotationType.TEXT
          ? rectAtPointCoordinates(n as RectNotation, cellCoordinates, userUUId)
          : false
      );
  } ;

  // return a list of notations wich overlap given rect coordinates
  function findNotationsByRectCoordinates (
    notationsMap: Map<String, Notation>,
    rectCoordinates: RectCoordinates
  ) {
    return Object.entries(notationsMap)
      .map((n: Notation[]) => n[1])
      .filter((n: Notation) =>
        n.notationType == NotationType.SYMBOL ||
        n.notationType == NotationType.POWER ||
        n.notationType == NotationType.SIGN
          ? pointAtRectCoordinates(
              n as PointNotation,
              rectCoordinates,
              userStore.currentUser.id
            )
          : n.notationType == NotationType.FRACTION ||
            n.notationType == NotationType.SQRT
          ? lineAtRectCoordinates(
              n as LineNotation,
              rectCoordinates,
              userStore.currentUser.id
            )
          : n.notationType == NotationType.TEXT
          ? rectAtRectCoordinates(
              n as RectNotation,
              rectCoordinates,
              userStore.currentUser.id
            )
          : false
      );
  }''

  // return a list of notations wich overlap given line coordinates
  function findNotationsByLineCoordinates (
    notationsMap: Map<String, Notation>,
    lineCoordinates: LineNotation
  ) {
    return Object.entries(notationsMap)
      .map((n: Notation[]) => n[1])
      .filter((n: Notation) =>
        n.notationType == NotationType.SYMBOL ||
        n.notationType == NotationType.POWER ||
        n.notationType == NotationType.SIGN
          ? pointAtLineCoordinates(
              n as PointNotation,
              lineCoordinates,
              userStore.currentUser.id
            )
          : n.notationType == NotationType.FRACTION ||
            n.notationType == NotationType.SQRT
          ? lineAtLineCoordinates(
              n as LineNotation,
              lineCoordinates,
              userStore.currentUser.id
            )
          : n.notationType == NotationType.TEXT
          ? rectAtLineCoordinates(
              n as RectNotation,
              lineCoordinates,
              userStore.currentUser.id
            )
          : false
      );
  };

  function findOverlapNotationsOfSameType(
    notationsMap: Map<String, Notation>,
    notation: Notation
  ): Notation | undefined {
    return Object.entries(notationsMap)
      .map((n: Notation[]) => n[1])
      .filter((n1: Notation) => n1.notationType === notation.notationType)
      .find((n2: Notation) => {
        switch (notation.notationType) {
          case NotationType.SYMBOL:
          case NotationType.SIGN:
          case NotationType.POWER:
            return pointAtPointCoordinates(
              notation as PointNotation,
              n2 as PointNotation,
              userStore.currentUser.id
            );
          case NotationType.FRACTION:
          case NotationType.SQRT:
            return lineAtLineCoordinates(
              notation as LineNotation,
              n2 as LineNotation,
              userStore.currentUser.id
            );
          case NotationType.TEXT:
          case NotationType.IMAGE:
          case NotationType.GEO:
            return rectAtRectCoordinates(
              notation as RectNotation,
              n2 as RectCoordinates,
              userStore.currentUser.id
            );
        }
      });
  };

  function findOverlapNotationsOfAnyType(
    notationsMap: Map<String, Notation>,
    notation: Notation
  ): Notation | undefined {
    return Object.entries(notationsMap)
      .map((n: Notation[]) => n[1])
      .find((n2: Notation) => {
        switch (notation.notationType) {
          case NotationType.SYMBOL:
          case NotationType.POWER:
            return (
              pointAtPointCoordinates(
                notation as PointNotation,
                n2 as PointNotation,
                userStore.currentUser.id
              ) ??
              lineAtPointCoordinates(
                notation as LineNotation,
                n2 as PointNotation,
                userStore.currentUser.id
              ) ??
              rectAtPointCoordinates(
                notation as RectNotation,
                n2 as PointNotation,
                userStore.currentUser.id
              )
            );
          case NotationType.FRACTION:
          case NotationType.SQRT:
            return (
              lineAtPointCoordinates(
                notation as LineNotation,
                n2 as PointNotation,
                userStore.currentUser.id
              ) ??
              lineAtLineCoordinates(
                notation as LineNotation,
                n2 as LineNotation,
                userStore.currentUser.id
              ) ??
              lineAtRectCoordinates(
                notation as LineNotation,
                n2 as RectCoordinates,
                userStore.currentUser.id
              )
            );

          case NotationType.TEXT:
          case NotationType.IMAGE:
          case NotationType.GEO:
            return (
              pointAtRectCoordinates(
                notation as PointNotation,
                n2 as RectCoordinates,
                userStore.currentUser.id
              ) ??
              lineAtRectCoordinates(
                notation as LineNotation,
                n2 as RectCoordinates,
                userStore.currentUser.id
              ) ??
              rectAtRectCoordinates(
                notation as RectNotation,
                n2 as RectCoordinates,
                userStore.currentUser.id
              )
            );
        }
      });
  };

  async function getNotationsByType(
    parentUUId: string,
    notationType: NotationType,
    boardType: BoardType
  ): Promise<Map<String, Notation>> {
    switch (notationType) {
      case NotationType.SYMBOL:
      case NotationType.SIGN:
      case NotationType.POWER:
        return getNotations<PointNotation>(
          parentUUId,
          notationType,
          boardType
        );
      case NotationType.FRACTION:
      case NotationType.SQRT:
        return getNotations<LineNotation>(
          parentUUId,
          notationType,
          boardType
        );
      case NotationType.GEO:
      case NotationType.IMAGE:
      case NotationType.TEXT:
        return getNotations<RectNotation>(
          parentUUId,
          notationType,
          boardType
        );
      default:
        return new Map();
    }
  };

  async function getNotations<T extends Notation>(
    parentUUId: string,
    notationType: NotationType,
    boardType: BoardType
  ): Promise<Map<String, Notation>> {
    let notations = await db.getNotations<T>(
      notationType,
      boardType,
      parentUUId
    );

    if (!notations) return new Map();

    return new Map<string, Notation>(
      notations.map((n: Notation) => [n.uuid, n])
    );
  };

  function getNotationsByBoard(
    parentUUId: string,
    boardType: BoardType
  ): Map<String, Notation> {
    let notations = new Map<String, Notation>();

    for (const nt in NotationType) {
      getNotationsByType(
          parentUUId,
          NotationType[nt as keyof typeof NotationType],
          boardType
        )
        .then((map) => {
          map?.forEach((e) => {
            notations.set(e.uuid, e);
          });
        });
    }

    return notations;
  };

  return {
    createCellOccupationMatrix,
    getNotationsByBoard,
    getNotations,
    getNotationsByType,
    findOverlapNotationsOfAnyType,
    findOverlapNotationsOfSameType,
    findNotationsByLineCoordinates,
    findNotationsByRectCoordinates,
    findNotationsByCellCoordinates,
    isNotationInQuestionArea,
    isCellInQuestionArea,
  };
};


