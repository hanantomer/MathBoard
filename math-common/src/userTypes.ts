import { EntityAttributes } from "./baseTypes";
import { UserType } from "./unions";
import { LessonAttributes } from "./lessonTypes";

export type UserAttributes = EntityAttributes & {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  access_token: string;
  imageUrl: string;
  userType: UserType;
  lastHeartbeatTime?: Date;
}

export type UserCreationAttributes = Omit<UserAttributes, keyof EntityAttributes> 

export type StudentLessonAttributes = EntityAttributes & {
  user: UserAttributes;
  lesson: LessonAttributes;
}

export type StudentLessonCreationAttributes = Omit<StudentLessonAttributes, keyof EntityAttributes> 
  
