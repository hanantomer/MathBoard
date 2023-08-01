"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bcryptjs = require("bcryptjs");
exports.default = {
    list: {
        fetch: {
            after: function (req, res, context) {
                // return token produced during authorization
                context.instance = context.user;
                return context.continue;
            },
        },
    },
};
