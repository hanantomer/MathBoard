import { CellCoordinates } from "common/globals";
import { BaseNotation } from "common/notationTypes";
import { EditMode, BoardType, NotationShape } from "common/enum";
type Board = {
    uuid: string;
    type: BoardType;
};
export declare const useNotationStore: import("pinia").StoreDefinition<"notation", import("pinia")._UnwrapAll<Pick<{
    getNotations: <T>(notationShape: NotationShape) => T[];
    editMode: import("vue").Ref<EditMode>;
    setCurrentEditMode: (newEditMode: EditMode) => void;
    parent: Board;
    notations: Map<String, BaseNotation>;
    cellOccupationMatrix: (BaseNotation | null)[][];
    activeCell: CellCoordinates | null;
    activeNotation: BaseNotation | null;
    setActiveCell: (newActiveCell: CellCoordinates | null) => Promise<void>;
    selectedNotations: string[];
    resetActiveCell: () => void;
    setParent: (parentUUID: string, boardType: BoardType) => Promise<void>;
}, "editMode" | "parent" | "notations" | "cellOccupationMatrix" | "activeCell" | "activeNotation" | "selectedNotations">>, Pick<{
    getNotations: <T>(notationShape: NotationShape) => T[];
    editMode: import("vue").Ref<EditMode>;
    setCurrentEditMode: (newEditMode: EditMode) => void;
    parent: Board;
    notations: Map<String, BaseNotation>;
    cellOccupationMatrix: (BaseNotation | null)[][];
    activeCell: CellCoordinates | null;
    activeNotation: BaseNotation | null;
    setActiveCell: (newActiveCell: CellCoordinates | null) => Promise<void>;
    selectedNotations: string[];
    resetActiveCell: () => void;
    setParent: (parentUUID: string, boardType: BoardType) => Promise<void>;
}, never>, Pick<{
    getNotations: <T>(notationShape: NotationShape) => T[];
    editMode: import("vue").Ref<EditMode>;
    setCurrentEditMode: (newEditMode: EditMode) => void;
    parent: Board;
    notations: Map<String, BaseNotation>;
    cellOccupationMatrix: (BaseNotation | null)[][];
    activeCell: CellCoordinates | null;
    activeNotation: BaseNotation | null;
    setActiveCell: (newActiveCell: CellCoordinates | null) => Promise<void>;
    selectedNotations: string[];
    resetActiveCell: () => void;
    setParent: (parentUUID: string, boardType: BoardType) => Promise<void>;
}, "getNotations" | "setCurrentEditMode" | "setActiveCell" | "resetActiveCell" | "setParent">>;
export {};
