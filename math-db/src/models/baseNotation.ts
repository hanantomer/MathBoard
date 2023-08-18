import { NotationType, BoardType } from "../../../math-common/src/enum";
import { UserAttributes } from "./user.model";


export interface BaseCreateNotation {
    userUUId: string;
    notationType: NotationType;
    boardType: BoardType;
}

export interface BaseNotation {
    id: number;
    uuid: string;
    user: UserAttributes;
    userUUId: string;
    notationType: NotationType;
    boardType: BoardType;
    createdAt: Date;
}