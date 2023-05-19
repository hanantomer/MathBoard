"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * used in conjunction with finalle rest to authorize requests
 */
const authUtil = require("./authUtil");
const dbUtil = require("../../math-db/build/dbUtil");
var ForbiddenError = require("finale-rest").Errors.ForbiddenError;
class AuthMiddleware {
    constructor() {
        this.middleware = {
            list: {
                auth: (req, res, context) => __awaiter(this, void 0, void 0, function* () {
                    return auth(req, context);
                }),
            },
            create: {
                auth: (req, res, context) => __awaiter(this, void 0, void 0, function* () {
                    return auth(req, context);
                }),
            },
            update: {
                auth: (req, res, context) => __awaiter(this, void 0, void 0, function* () {
                    return auth(req, context);
                }),
                write: {
                    before: (req, res, context) => __awaiter(this, void 0, void 0, function* () {
                        return preventOverride(req, context);
                    }),
                },
            },
            delete: {
                auth: (req, res, context) => __awaiter(this, void 0, void 0, function* () {
                    return auth(req, context);
                }),
                write: {
                    before: (req, res, context) => __awaiter(this, void 0, void 0, function* () {
                        return preventOverride(req, context);
                    }),
                },
            },
        };
    }
}
exports.default = AuthMiddleware;
;
function preventOverride(req, context) {
    return __awaiter(this, void 0, void 0, function* () {
        // prevnet teacher from deleting or updating student answer notations
        if ((req.method === "DELETE" || req.method === "PUT") &&
            req.url.indexOf("/answers") === 0) {
            let notation = yield dbUtil.getNotation(req.params.id, req.url);
            if ((notation === null || notation === void 0 ? void 0 : notation.UserId) != context.user.id) {
                throw new ForbiddenError("Unauthorized");
            }
        }
        return context.continue;
    });
}
function auth(req, context) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = null;
        if (!!req.query.password) {
            // login
            user = yield authPassword(req);
        }
        else if (
        // bearer token
        !!req.headers.authentication &&
            req.headers.authentication.indexOf("Bearer") == 0) {
            user = yield authBearer(req);
        }
        else if (!!req.headers.authentication) {
            // local token
            user = yield authLocal(req);
        }
        else if (req.url === "/users") {
            // allow registration
            return context.continue();
        }
        if (!user) {
            throw new ForbiddenError("Not authenticated");
        }
        context.user = user;
        return context.continue;
    });
}
function authLocal(req) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = yield authUtil.authByLocalToken(req.headers.authentication);
        // set email for upcoming find
        req.query.email = user.email;
        return user;
    });
}
function authBearer(req) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = yield authUtil.authByGoogleToken(req.headers.authentication);
        // set email for upcoming find
        req.query.email = user.email;
        return user;
    });
}
function authPassword(req) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield authUtil.authByLocalPassword(req.query.email, req.query.password);
    });
}
//# sourceMappingURL=authMiddleware.js.map