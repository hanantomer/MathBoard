"use strict";
const bcryptjs = require("bcryptjs");
export default {
    list: {
        fetch: {
            after: function (req: any, res: any, context: any) {
                // return token produced during authorization
                context.instance = context.user;
                return context.continue;
            },
        },
    },
};
