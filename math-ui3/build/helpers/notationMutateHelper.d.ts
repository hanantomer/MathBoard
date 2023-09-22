import { EditMode } from "common/enum";
import { CellCoordinates } from "common/globals";
import { BaseNotation, LineAttributes } from "common/baseTypes";
export default function notationMutateHelper(): {
    selectNotation: (CellCoordinates: CellCoordinates) => Promise<void>;
    setActiveCell: (newActiveCell: CellCoordinates | null) => Promise<void>;
    setActiveNotation: (activeNotation: BaseNotation | null) => Promise<void>;
    addSymbolNotation: (value: string) => void;
    addMarkNotation: () => void;
    addImageNotation: (fromCol: number, toCol: number, fromRow: number, toRow: number, base64Value: string) => void;
    addTextNotation: (fromCol: number, toCol: number, fromRow: number, toRow: number, value: string) => void;
    addFractiontNotation: (coordinates: LineAttributes) => void;
    addSqrtNotation: (coordinates: LineAttributes) => void;
    removeActiveOrSelectedNotations: () => void;
    moveSelectedNotations: (deltaX: number, deltaY: number) => Promise<void>;
    updateSelectedNotationCoordinates: () => Promise<void>;
    setCurrentEditMode: (editMode: EditMode) => void;
};
