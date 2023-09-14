import { CellCoordinates } from "common/globals";
export default function activateObjectHelper(): {
    activateCell: (activeCell: CellCoordinates | null, prevActiveCell: CellCoordinates | null) => void;
    reset: () => void;
    activateClickedObject: (e: MouseEvent) => CellCoordinates | null;
};
