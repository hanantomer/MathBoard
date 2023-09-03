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
    function removePointFromOccupationMatrix(matrix, pointNotation) {
        matrix[pointNotation.row][pointNotation.col] = null;
    }
    function removeLineFromOccupationMatrix(matrix, line) {
        for (let col = line.fromCol; col <= line.toCol; col++) {
            matrix[line.row][col] = null;
        }
    }
    function removeRectFromOccupationMatrix(matrix, rect) {
        for (let row = rect.fromRow; row <= rect.toRow; row++) {
            for (let col = rect.fromCol; col <= rect.toCol; col++) {
                matrix[row][col] = null;
            }
        }
    }
    function addPointToOccupationMatrix(matrix, notation) {
        matrix[notation.row][notation.col] = notation;
    }
    // addToOccupationMatrix: function (matrix: any, notation: LineAttributes) {
    //   for (let col = notation.fromCol; col <= notation.toCol; col++) {
    //     matrix[notation.row][col] = notation;
    //   }
    // },
    function addRectToOccupationMatrix(matrix, notation) {
        for (let row = notation.fromRow; row <= notation.toRow; row++) {
            for (let col = notation.fromCol; col <= notation.toCol; col++) {
                matrix[row][col] = notation;
            }
        }
    }
    return {};
}
//# sourceMappingURL=notationCellOccupationHelper.js.map