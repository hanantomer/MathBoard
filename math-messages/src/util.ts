import useAuthUtil from "../../math-auth/build/authUtil";
import { UserAttributes } from "../../math-common/build/userTypes";
const authUtil = useAuthUtil();

export default {
  getAccessTokenFromCookie: function (
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
    
    let access_token =  this.getAccessTokenFromCookie(cookie);

    const user = await authUtil.authByLocalToken(
      access_token
    );

    if (!user) {
      console.error(
        `access_token:${access_token} not associated with any user`
      );
      return null;
    }

    return user;
  },
};
