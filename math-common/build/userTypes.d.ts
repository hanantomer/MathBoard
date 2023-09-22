import { BaseEntity, BaseNotation } from "./baseTypes";
import { UesrType } from "./enum";
import { LessonAttributes } from "./lessonTypes";
export interface UserAttributes extends BaseEntity {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    access_token: string;
    imageUrl: string;
    userType: UesrType;
    authorized: boolean;
    lastHeartbeatTime: Date;
}
export type UserCreationAttributes = Omit<UserAttributes, keyof BaseEntity>;
export interface StudentLessonAttributes extends BaseNotation {
    user: UserAttributes;
    userId: number;
    lessonId: number;
    lesson: LessonAttributes;
}
export type StudentLessonCreateAttributes = Omit<StudentLessonAttributes, keyof BaseEntity>;
