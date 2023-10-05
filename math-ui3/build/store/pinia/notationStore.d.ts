import { CellCoordinates } from "common/globals";
import { NotationAttributes } from "common/baseTypes";
import { EditMode, BoardType, NotationShape } from "common/unions";
export declare const useNotationStore: import("pinia").StoreDefinition<"notation", import("pinia")._UnwrapAll<Pick<{
    getNotations: () => import("vue").Ref<Map<String, NotationAttributes>>;
    getNotationsByShape: <T>(notationShape: NotationShape) => T[];
    getEditMode: () => import("vue").Ref<EditMode>;
    getCellOccupationMatrix: () => (NotationAttributes | null)[][];
    getActiveCell: () => import("vue").Ref<{
        col: number;
        row: number;
    } | null>;
    getActiveNotation: () => NotationAttributes | null;
    getSelectedNotations: () => string[];
    getParent: () => import("vue").Ref<{
        uuid: string;
        type: BoardType;
    }>;
    addNotation: (notation: NotationAttributes) => void;
    setNotations: (notations: Map<String, NotationAttributes>) => void;
    setActiveNotation: (notation: NotationAttributes | null) => void;
    setCurrentEditMode: (newEditMode: EditMode) => void;
    setParent: (parentUUID: string, boardType: BoardType) => void;
    setActiveCell: (newActiveCell: CellCoordinates | null) => void;
    resetActiveCell: () => void;
    resetSelectedNotations: () => void;
    activeCell: import("vue").Ref<{
        col: number;
        row: number;
    } | null>;
    activeNotation: NotationAttributes | null;
}, "activeCell" | "activeNotation">>, Pick<{
    getNotations: () => import("vue").Ref<Map<String, NotationAttributes>>;
    getNotationsByShape: <T>(notationShape: NotationShape) => T[];
    getEditMode: () => import("vue").Ref<EditMode>;
    getCellOccupationMatrix: () => (NotationAttributes | null)[][];
    getActiveCell: () => import("vue").Ref<{
        col: number;
        row: number;
    } | null>;
    getActiveNotation: () => NotationAttributes | null;
    getSelectedNotations: () => string[];
    getParent: () => import("vue").Ref<{
        uuid: string;
        type: BoardType;
    }>;
    addNotation: (notation: NotationAttributes) => void;
    setNotations: (notations: Map<String, NotationAttributes>) => void;
    setActiveNotation: (notation: NotationAttributes | null) => void;
    setCurrentEditMode: (newEditMode: EditMode) => void;
    setParent: (parentUUID: string, boardType: BoardType) => void;
    setActiveCell: (newActiveCell: CellCoordinates | null) => void;
    resetActiveCell: () => void;
    resetSelectedNotations: () => void;
    activeCell: import("vue").Ref<{
        col: number;
        row: number;
    } | null>;
    activeNotation: NotationAttributes | null;
}, never>, Pick<{
    getNotations: () => import("vue").Ref<Map<String, NotationAttributes>>;
    getNotationsByShape: <T>(notationShape: NotationShape) => T[];
    getEditMode: () => import("vue").Ref<EditMode>;
    getCellOccupationMatrix: () => (NotationAttributes | null)[][];
    getActiveCell: () => import("vue").Ref<{
        col: number;
        row: number;
    } | null>;
    getActiveNotation: () => NotationAttributes | null;
    getSelectedNotations: () => string[];
    getParent: () => import("vue").Ref<{
        uuid: string;
        type: BoardType;
    }>;
    addNotation: (notation: NotationAttributes) => void;
    setNotations: (notations: Map<String, NotationAttributes>) => void;
    setActiveNotation: (notation: NotationAttributes | null) => void;
    setCurrentEditMode: (newEditMode: EditMode) => void;
    setParent: (parentUUID: string, boardType: BoardType) => void;
    setActiveCell: (newActiveCell: CellCoordinates | null) => void;
    resetActiveCell: () => void;
    resetSelectedNotations: () => void;
    activeCell: import("vue").Ref<{
        col: number;
        row: number;
    } | null>;
    activeNotation: NotationAttributes | null;
}, "getNotations" | "getNotationsByShape" | "getEditMode" | "getCellOccupationMatrix" | "getActiveCell" | "getActiveNotation" | "getSelectedNotations" | "getParent" | "addNotation" | "setNotations" | "setActiveNotation" | "setCurrentEditMode" | "setParent" | "setActiveCell" | "resetActiveCell" | "resetSelectedNotations">>;
