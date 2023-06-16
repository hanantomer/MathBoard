import { NotationType, BoardType } from "../../../math-common/src/enum";
export interface BaseModel {
    uuid: string;
    userId: number;
    value: string | null;
    notationType: NotationType;
    boardType: BoardType;
}
