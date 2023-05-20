export default {
  getAccessTokenFromCookie: async function (cookie: any) {
    if (!!cookie)
      return cookie.match("(^|;)\\s*access_token\\s*=\\s*([^;]+)")?.pop() || "";
  },
  getUserFromCookie: async function (cookie: any, app: any) {
    if (!cookie) return;
    let access_token = await this.getAccessTokenFromCookie(cookie);
    return await app.service("authentication").authUserByToken(access_token);
  },
};
