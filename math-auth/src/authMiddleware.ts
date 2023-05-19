/**
 * used in conjunction with finalle rest to authorize requests
 */
const authUtil = require("./authUtil");
const dbUtil = require("../../math-db/build/dbUtil");
var ForbiddenError = require("finale-rest").Errors.ForbiddenError;

export default class AuthMiddleware {
    
    middleware: Object = {
        list: {
            auth: async (req: any, res: any, context: any) => {
                return auth(req, context);
            },
        },
        create: {
            auth: async (req: any, res: any, context: any) => {
                return auth(req, context);
            },
        },
        update: {
            auth: async (req: any, res: any, context: any) => {
                return auth(req, context);
            },
            write: {
                before: async (req: any, res: any, context: any) => {
                    return preventOverride(req, context);
                },
            },
        },
        delete: {
            auth: async (req: any, res: any, context: any) => {
                return auth(req, context);
            },
            write: {
                before: async (req: any, res: any, context: any) => {
                    return preventOverride(req, context);
                },
            },
        },
    }
};

async function preventOverride(req: any, context: any) {
    // prevnet teacher from deleting or updating student answer notations
    if (
        (req.method === "DELETE" || req.method === "PUT") &&
        req.url.indexOf("/answers") === 0
    ) {
        let notation = await dbUtil.getNotation(req.params.id, req.url);
        if (notation?.UserId != context.user.id) {
            throw new ForbiddenError("Unauthorized");
        }
    }
    return context.continue;
}

async function auth(req: any, context: any) {
    let user = null;
    if (!!req.query.password) {
        // login
        user = await authPassword(req);
    } else if (
        // bearer token
        !!req.headers.authentication &&
        req.headers.authentication.indexOf("Bearer") == 0
    ) {
        user = await authBearer(req);
    } else if (!!req.headers.authentication) {
        // local token
        user = await authLocal(req);
    } else if (req.url === "/users") {
        // allow registration
        return context.continue();
    }

    if (!user) {
        throw new ForbiddenError("Not authenticated");
    }
    context.user = user;
    return context.continue;
}

async function authLocal(req: any) {
    let user = await authUtil.authByLocalToken(req.headers.authentication);
    // set email for upcoming find
    req.query.email = user.email;
    return user;
}

async function authBearer(req: any) {
    let user = await authUtil.authByGoogleToken(req.headers.authentication);
    // set email for upcoming find
    req.query.email = user.email;
    return user;
}

async function authPassword(req: any) {
    return await authUtil.authByLocalPassword(
        req.query.email,
        req.query.password
    );
}
