import { PointNotation, LineNotation } from "./responseTypes";
import { RectCoordinates } from "../../../math-common/src/globals";
import { useNotationStore } from "../store/pinia/notationStore";
import { onMounted } from "vue";

const notationStore = useNotationStore();


export default function notationCellOccupationHelper() {

  onMounted(() => {
    notationStore.$subscribe((mutation, state) => {
      console.log("a change happened");
      console.log(mutation, state);
    });
  });

  function removePointFromOccupationMatrix(
    matrix: any,
    pointNotation: PointNotation
  ) {
    matrix[pointNotation.row][pointNotation.col] = null;
  }

  function removeLineFromOccupationMatrix(matrix: any, line: LineNotation) {
    for (let col: number = line.fromCol; col <= line.toCol; col++) {
      matrix[line.row][col] = null;
    }
  }

  function removeRectFromOccupationMatrix(matrix: any, rect: RectCoordinates) {
    for (let row = rect.fromRow; row <= rect.toRow; row++) {
      for (let col = rect.fromCol; col <= rect.toCol; col++) {
        matrix[row][col] = null;
      }
    }
  }

  function addPointToOccupationMatrix(matrix: any, notation: PointNotation) {
    matrix[notation.row][notation.col] = notation;
  }

  // addToOccupationMatrix: function (matrix: any, notation: LineNotation) {
  //   for (let col = notation.fromCol; col <= notation.toCol; col++) {
  //     matrix[notation.row][col] = notation;
  //   }
  // },

  function addRectToOccupationMatrix(matrix: any, notation: RectCoordinates) {
    for (let row = notation.fromRow; row <= notation.toRow; row++) {
      for (let col = notation.fromCol; col <= notation.toCol; col++) {
        matrix[row][col] = notation;
      }
    }
  }

  return {};
}
