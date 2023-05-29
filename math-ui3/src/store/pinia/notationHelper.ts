import {
  PointNotation,
  LineNotation,
  RectNotation,
  Notation,
} from "../../Mixins/responseTypes";
import { dbSync } from "../../Mixins/dbSyncMixin";
const db = dbSync();
import globals from "../../../../math-common/src/globals";
import { NotationType, BoardType } from "../../../../math-common/src/enum";
import { useUserStore } from "./userStore";
const userStore = useUserStore();


export const helper = {
  // matrix which marks in true each occupied cell
  createCellOccupationMatrix: function () {
    let matrix: Notation | null[][] = new Array();
    for (let i = 0; i < globals.colsNum; i++) {
      for (let j = 0; j < globals.colsNum; j++) {
        matrix[i][j] = null;
      }
    }
    return matrix;
  },

  // removeFromOccupationMatrix: function (
  //   matrix: any,
  //   notation: PointNotation
  // ) {
  //   matrix[notation.row][notation.col] = null;
  // },

  removePointFromOccupationMatrix: function (
    matrix: any,
    pointNotation: PointNotation
  ) {
    matrix[pointNotation.row][pointNotation.col] = null;
  },

  removeLineFromOccupationMatrix: function (matrix: any, line: LineNotation) {
    for (let col: number = line.fromCol; col <= line.toCol; col++) {
      matrix[line.row][col] = null;
    }
  },

  removeRectFromOccupationMatrix: function (matrix: any, rect: RectNotation) {
    for (let row = rect.fromRow; row <= rect.toRow; row++) {
      for (let col = rect.fromCol; col <= rect.toCol; col++) {
        matrix[row][col] = null;
      }
    }
  },

  addPointToOccupationMatrix: function (matrix: any, notation: PointNotation) {
    matrix[notation.row][notation.col] = notation;
  },

  // addToOccupationMatrix: function (matrix: any, notation: LineNotation) {
  //   for (let col = notation.fromCol; col <= notation.toCol; col++) {
  //     matrix[notation.row][col] = notation;
  //   }
  // },

  addRectToOccupationMatrix: function (matrix: any, notation: RectNotation) {
    for (let row = notation.fromRow; row <= notation.toRow; row++) {
      for (let col = notation.fromCol; col <= notation.toCol; col++) {
        matrix[row][col] = notation;
      }
    }
  },

  // return true for student in question and row is inside question area
  isStudentInQuestionArea(
    notation: PointNotation,
    editBoardType: BoardType,
    existingBoardType: BoardType
  ) {
    return (
      notation.row &&
      notation.col &&
      editBoardType === BoardType.QUESTION && //
      !userStore.isTeacher &&
      existingBoardType === BoardType.QUESTION
      //matrix[row][col]?.boardType === BoardType.QUESTION
    );
  },

  // point
  pointAtPointCoordinates: function (n1: PointNotation, n2: PointNotation) {
    return n1.col == n2.col && n1.row == n2.row && n1.userId === n2.userId;
  },

  pointAtLineCoordinates: function (
    pointCoordinates: PointNotation,
    lineCoordinates: LineNotation
  ) {
    return (
      pointCoordinates.col >= lineCoordinates.fromCol &&
      pointCoordinates.col <= lineCoordinates.toCol &&
      pointCoordinates.row == lineCoordinates.row
    );
  },

  pointAtRectCoordinates: function (
    pointCoordinates: PointNotation,
    rectCoordinates: RectNotation
  ) {
    return (
      pointCoordinates.col >= rectCoordinates.fromCol &&
      pointCoordinates.col <= rectCoordinates.toCol &&
      pointCoordinates.row >= rectCoordinates.fromRow &&
      pointCoordinates.row <= rectCoordinates.toRow
    );
  },

  // line
  lineAtPointCoordinates: function (
    lineCoordinates: LineNotation,
    pointCoordinates: PointNotation
  ) {
    return (
      lineCoordinates.fromCol <= pointCoordinates.col &&
      lineCoordinates.toCol >= pointCoordinates.col &&
      lineCoordinates.row == pointCoordinates.row
    );
  },

  lineAtLineCoordinates: function (
    line1Coordinates: LineNotation,
    line2Coordinates: LineNotation
  ) {
    return (
      ((line1Coordinates.fromCol >= line2Coordinates.fromCol &&
        line1Coordinates.fromCol <= line2Coordinates.toCol) ||
        (line1Coordinates.toCol >= line2Coordinates.fromCol &&
          line1Coordinates.toCol <= line2Coordinates.toCol)) &&
      line1Coordinates.row == line2Coordinates.row
    );
  },

  lineAtRectCoordinates: function (
    lineCoordinates: LineNotation,
    rectCoordinates: RectNotation
  ) {
    return (
      ((lineCoordinates.fromCol >= rectCoordinates.fromCol &&
        lineCoordinates.fromCol <= rectCoordinates.toCol) ||
        (lineCoordinates.toCol >= rectCoordinates.fromCol &&
          lineCoordinates.toCol <= rectCoordinates.toCol)) &&
      lineCoordinates.row >= rectCoordinates.fromRow &&
      lineCoordinates.row <= rectCoordinates.toRow
    );
  },

  // rect
  rectAtPointCoordinates: function (
    rectCoordinates: RectNotation,
    pointCoordinates: PointNotation
  ) {
    return (
      rectCoordinates.fromCol <= pointCoordinates.col &&
      rectCoordinates.toCol >= pointCoordinates.col &&
      rectCoordinates.fromRow <= pointCoordinates.row &&
      rectCoordinates.toRow >= pointCoordinates.row
    );
  },

  rectAtLineCoordinates: function (
    rectCoordinates: RectNotation,
    lineCoordinates: LineNotation
  ) {
    return (
      ((rectCoordinates.fromCol >= lineCoordinates.fromCol &&
        rectCoordinates.fromCol <= lineCoordinates.toCol) ||
        (rectCoordinates.toCol >= lineCoordinates.fromCol &&
          rectCoordinates.toCol <= lineCoordinates.toCol)) &&
      rectCoordinates.fromRow <= lineCoordinates.row &&
      rectCoordinates.toRow >= lineCoordinates.row
    );
  },

  rectAtRectCoordinates: function (
    rect1Coordinates: RectNotation,
    rect2Coordinates: RectNotation
  ) {
    return (
      ((rect1Coordinates.fromCol >= rect2Coordinates.fromCol &&
        rect1Coordinates.fromCol <= rect2Coordinates.toCol) ||
        (rect1Coordinates.toCol >= rect2Coordinates.fromCol &&
          rect1Coordinates.toCol <= rect2Coordinates.toCol)) &&
      ((rect1Coordinates.fromRow >= rect2Coordinates.fromRow &&
        rect1Coordinates.fromRow <= rect2Coordinates.toRow) ||
        (rect1Coordinates.toRow >= rect2Coordinates.fromRow &&
          rect1Coordinates.toRow <= rect2Coordinates.toRow))
    );
  },

  // return a list of notations wich overlap given point coordinates
  findNotationsByCellCoordinates: function (
    notationsMap: Map<String, Notation>,
    pointCoordinates: PointNotation
  ) {
    return Object.entries(notationsMap)
      .map((n: Notation[]) => n[1])
      .filter((n: Notation) =>
        n.notationType == NotationType.SYMBOL || // maybe replace type with reflection
        n.notationType == NotationType.POWER ||
        n.notationType == NotationType.SIGN
          ? helper.pointAtPointCoordinates(n as PointNotation, pointCoordinates)
          : n.notationType == NotationType.FRACTION ||
            n.notationType == NotationType.SQRT
          ? helper.lineAtPointCoordinates(n as LineNotation, pointCoordinates)
          : n.notationType == NotationType.TEXT
          ? helper.rectAtPointCoordinates(n as RectNotation, pointCoordinates)
          : false
      );
  },

  // return a list of notations wich overlap given rect coordinates
  findNotationsByRectCoordinates: function (
    notationsMap: Map<String, Notation>,
    rectCoordinates: RectNotation
  ) {
    return Object.entries(notationsMap)
      .map((n: Notation[]) => n[1])
      .filter((n: Notation) =>
        n.notationType == NotationType.SYMBOL ||
        n.notationType == NotationType.POWER ||
        n.notationType == NotationType.SIGN
          ? helper.pointAtRectCoordinates(n as PointNotation, rectCoordinates)
          : n.notationType == NotationType.FRACTION ||
            n.notationType == NotationType.SQRT
          ? helper.lineAtRectCoordinates(n as LineNotation, rectCoordinates)
          : n.notationType == NotationType.TEXT
          ? helper.rectAtRectCoordinates(n as RectNotation, rectCoordinates)
          : false
      );
  },

  // return a list of notations wich overlap given line coordinates
  findNotationsByLineCoordinates: function (
    notationsMap: Map<String, Notation>,
    lineCoordinates: LineNotation
  ) {
    return Object.entries(notationsMap)
      .map((n: Notation[]) => n[1])
      .filter((n: Notation) =>
        n.notationType == NotationType.SYMBOL ||
        n.notationType == NotationType.POWER ||
        n.notationType == NotationType.SIGN
          ? helper.pointAtLineCoordinates(n as PointNotation, lineCoordinates)
          : n.notationType == NotationType.FRACTION ||
            n.notationType == NotationType.SQRT
          ? helper.lineAtLineCoordinates(n as LineNotation, lineCoordinates)
          : n.notationType == NotationType.TEXT
          ? helper.rectAtLineCoordinates(n as RectNotation, lineCoordinates)
          : false
      );
  },

  findOverlapNotationsOfSameType(
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
            return helper.pointAtPointCoordinates(
              notation as PointNotation,
              n2 as PointNotation
            );
          case NotationType.FRACTION:
          case NotationType.SQRT:
            return helper.lineAtLineCoordinates(
              notation as LineNotation,
              n2 as LineNotation
            );
          case NotationType.TEXT:
          case NotationType.IMAGE:
          case NotationType.GEO:
            return helper.rectAtRectCoordinates(
              notation as RectNotation,
              n2 as RectNotation
            );
        }
      });
  },

  findOverlapNotationsOfAnyType(
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
              helper.pointAtPointCoordinates(
                notation as PointNotation,
                n2 as PointNotation
              ) ??
              helper.lineAtPointCoordinates(
                notation as LineNotation,
                n2 as PointNotation
              ) ??
              helper.rectAtPointCoordinates(
                notation as RectNotation,
                n2 as PointNotation
              )
            );
          case NotationType.FRACTION:
          case NotationType.SQRT:
            return (
              helper.lineAtPointCoordinates(
                notation as LineNotation,
                n2 as PointNotation
              ) ??
              helper.lineAtLineCoordinates(
                notation as LineNotation,
                n2 as LineNotation
              ) ??
              helper.lineAtRectCoordinates(
                notation as LineNotation,
                n2 as RectNotation
              )
            );

          case NotationType.TEXT:
          case NotationType.IMAGE:
          case NotationType.GEO:
            return (
              helper.pointAtRectCoordinates(
                notation as PointNotation,
                n2 as RectNotation
              ) ??
              helper.lineAtRectCoordinates(
                notation as LineNotation,
                n2 as RectNotation
              ) ??
              helper.rectAtRectCoordinates(
                notation as RectNotation,
                n2 as RectNotation
              )
            );
        }
      });
  },

  async getNotationsByType(
    parentUUId: string,
    notationType: NotationType,
    boardType: BoardType
  ): Promise<Map<String, Notation> | null> {

    switch (notationType) {
      case NotationType.SYMBOL:
      case NotationType.SIGN:
      case NotationType.POWER:
        return this.getNotations<PointNotation[]>(
          parentUUId,
          notationType,
          boardType
        );
      case NotationType.FRACTION:
      case NotationType.SQRT:
        return this.getNotations<LineNotation[]>(
          parentUUId,
          notationType,
          boardType
        );
      case NotationType.GEO:
      case NotationType.IMAGE:
      case NotationType.TEXT:
        return this.getNotations<LineNotation[]>(
          parentUUId,
          notationType,
          boardType
        );
      default:
        return null;
    }
  },

  async getNotations<T extends any[]>(
    parentUUId: string,
    notationType: NotationType,
    boardType: BoardType
  ): Promise<Map<String, Notation> | null> {
    let notations = await db.getNotations<T>(
      notationType,
      boardType,
      parentUUId
    );

    if (!notations) return null;

    return new Map<string, Notation>(notations.map((n: Notation) => [n.uuid, n]));
  },

  getNotationsByBoard(
    parentUUId: string,
    boardType: BoardType
  ): Map<String, Notation> {
    let notations = new Map<String, Notation>();

    for (const nt in NotationType) {
      helper
        .getNotationsByType(
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
  },
};


