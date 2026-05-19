import useApiHelper from "../helpers/apiHelper";
import { useUserStore } from "../store/pinia/userStore";
import { UserAttributes } from "common/userTypes";

/** Load current user from access_token cookie when Pinia store is empty. */
export async function restoreSessionFromCookie(): Promise<UserAttributes | null> {
  const userStore = useUserStore();
  const existing = userStore.getCurrentUser();
  if (existing) {
    return existing;
  }

  const user = await useApiHelper().getUserByAccessToken();
  if (user) {
    userStore.setCurrentUser(user);
  }
  return user;
}
