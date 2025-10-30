import { EntityAttributes } from "./baseTypes";
import { UserType } from "./unions";
import { LessonAttributes } from "./lessonTypes";

export type UserAttributes = EntityAttributes & {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  access_token: string|null;
  reset_pasword_token: string|null;
  imageUrl: string;
  userType: UserType;
  lastHeartbeatTime?: Date;
  approved: boolean;
};

export type UserCreationAttributes = Omit<UserAttributes, keyof EntityAttributes> 

export type StudentLessonAttributes = EntityAttributes & {
  user: UserAttributes;
  lesson: LessonAttributes;
}

export type StudentLessonCreationAttributes = Omit<StudentLessonAttributes, keyof EntityAttributes> 
  
