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
const db = require("../../math-db/build/models/index");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const clientSecretData = require("../client_secret.json");
const oAuth2client = new OAuth2Client(clientSecretData.web.client_id);
class AuthUtils {
    constructor() {
        this.userCache = new Map();
    }
    authByLocalPassword(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO add caching
            let user = yield db.sequelize.models["User"].findOne({
                where: { email: email },
                attributes: { include: ["password"] },
            });
            if (!user) {
                return null;
            }
            // validate password
            let passwordMatched = !!user && (yield bcryptjs.compare(password, user.password));
            if (passwordMatched) {
                let access_token = jwt.sign({ email: user.email }, clientSecretData.client_secret, { expiresIn: 86400 * 30 });
                user.access_token = access_token;
                user.password = null;
                return user;
            }
            return null;
        });
    }
    authByLocalToken(access_token) {
        return __awaiter(this, void 0, void 0, function* () {
            let decodedToken = jwt.verify(access_token, clientSecretData.client_secret);
            // TODO - check expiration
            if (!this.userCache.get(decodedToken.email)) {
                this.userCache.set(decodedToken.email, yield db.sequelize.models["User"].findOne({
                    where: { email: decodedToken.email },
                }));
            }
            return this.userCache.get(decodedToken.email);
        });
    }
    authByGoogleToken(access_token) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticket = yield oAuth2client
                .verifyIdToken({
                idToken: access_token.replace("Bearer ", ""),
                audience: clientSecretData.web.client_id,
            })
                .catch(console.error); //TODO log error
            if (!!ticket) {
                let user = yield db.sequelize.models["User"].findOne({
                    where: { email: ticket.payload.email },
                });
                return user;
            }
        });
    }
}
exports.default = AuthUtils;
//# sourceMappingURL=authUtil.js.map