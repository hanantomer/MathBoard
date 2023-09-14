import { CellCoordinates } from "common/globals";
import { BaseNotation } from "common/notationTypes";
export default function userOutgoingOperations(): {
    syncOutgoingUpdateSelectedNotation: (selectedNotation: BaseNotation) => void;
    syncOutgoingActiveCell: (activeCell: CellCoordinates) => void;
    syncOutgoingAuthUser: (authorizedStudentUUId: string, revokedStudentUUId: string, LessonUUId: string) => void;
    syncOutgoingHeartBeat: (LessonUUId: string) => void;
    syncOutgoingRemoveNotation: (notation: BaseNotation) => void;
    syncOutgoingSaveNotation: (notation: BaseNotation) => void;
};
