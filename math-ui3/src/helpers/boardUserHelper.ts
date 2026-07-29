import { UserAttributes } from "common/userTypes";
import { useUserStore } from "../store/pinia/userStore";
import { isPracticeBoard } from "./practiceBoardAdapter";

/** Synthetic user for local PRACTICE notations when not logged in. */
export const GUEST_BOARD_USER: UserAttributes = {
  uuid: "00000000-0000-4000-8000-000000000001",
  firstName: "Guest",
  lastName: "",
  email: "",
  password: "",
  access_token: null,
  reset_pasword_token: null,
  imageUrl: "",
  userType: "STUDENT",
  approved: true,
};

/** User for notation ownership — guest stub allowed only on practice boards. */
export function getBoardUser(): UserAttributes {
  const current = useUserStore().getCurrentUser();
  if (current) return current;
  if (isPracticeBoard()) return GUEST_BOARD_USER;
  throw new Error("User must be signed in to edit this board");
}
