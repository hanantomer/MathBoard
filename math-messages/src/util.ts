import useAuthUtil from "../../math-auth/build/authUtil";
import { UserAttributes } from "../../math-common/build/userTypes";
const authUtil = useAuthUtil();

export default {
  getAccessTokenFromCookie: async function (
    cookie: any
  ) {
    if (!!cookie)
      return (
        cookie
          .match(
            "(^|;)\\s*access_token\\s*=\\s*([^;]+)"
          )
          ?.pop() || ""
      );
  },

  getUserFromCookie: async function (
    cookie: any
  ): Promise<UserAttributes | null> {
    
    if (!cookie) return null;
    
    let access_token =
      await this.getAccessTokenFromCookie(cookie);

    return await authUtil.authByLocalToken(
      access_token
    );
  },
};
