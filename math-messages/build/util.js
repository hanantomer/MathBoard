"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    getAccessTokenFromCookie: async function (cookie) {
        if (!!cookie)
            return cookie.match("(^|;)\\s*access_token\\s*=\\s*([^;]+)")?.pop() || "";
    },
    getUserFromCookie: async function (cookie, app) {
        if (!cookie)
            return;
        let access_token = await this.getAccessTokenFromCookie(cookie);
        return await app.service("authentication").authUserByToken(access_token);
    },
};
//# sourceMappingURL=util.js.map