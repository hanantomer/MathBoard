import { CellCoordinates } from "common/globals";
import { NotationAttributes } from "common/baseTypes";
export default function userOutgoingOperations(): {
    syncOutgoingUpdateSelectedNotation: (selectedNotation: NotationAttributes) => void;
    syncOutgoingActiveCell: (activeCell: CellCoordinates) => void;
    syncOutgoingAuthUser: (authorizedStudentUUId: string, revokedStudentUUId: string, LessonUUId: string) => void;
    syncOutgoingHeartBeat: (LessonUUId: string) => void;
    syncOutgoingRemoveNotation: (uuid: string) => void;
    syncOutgoingSaveNotation: (notation: NotationAttributes) => void;
};
