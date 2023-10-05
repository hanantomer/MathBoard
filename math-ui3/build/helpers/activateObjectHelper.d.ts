import { CellCoordinates } from "common/globals";
export default function activateObjectHelper(): {
    activateCell: (svgId: string, prevActiveCell: CellCoordinates | undefined, activeCell: CellCoordinates) => void;
    reset: () => void;
    activateClickedObject: (e: MouseEvent) => CellCoordinates | null;
};
