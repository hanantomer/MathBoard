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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const bcryptjs_1 = require("bcryptjs");
const google_auth_library_1 = require("google-auth-library");
const client_secret_json_1 = __importDefault(require("./client_secret.json"));
const user_model_1 = __importDefault(require("../../math-db/build/models/user.model"));
const oAuth2client = new google_auth_library_1.OAuth2Client(client_secret_json_1.default.web.client_id);
const userCache = new Map();
function useAuthUtils() {
    function authByLocalPassword(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email || !password)
                return null;
            //TODO add caching
            let user = yield user_model_1.default.findOne({
                where: { email: email },
                attributes: { include: ["password"] },
            });
            if (!user) {
                return null;
            }
            // validate password
            let passwordMatched = !!user && (yield (0, bcryptjs_1.compare)(password, user.password));
            if (passwordMatched) {
                let access_token = (0, jsonwebtoken_1.sign)({ email: user.email }, client_secret_json_1.default.client_secret, { expiresIn: 86400 * 30 });
                user.access_token = access_token;
                user.password = "";
                return user;
            }
            return null;
        });
    }
    ;
    function authByLocalToken(access_token) {
        return __awaiter(this, void 0, void 0, function* () {
            let decodedToken = (0, jsonwebtoken_1.verify)(access_token, client_secret_json_1.default.client_secret);
            // TODO - check expiration
            if (!userCache.get(decodedToken.email)) {
                let user = yield user_model_1.default.findOne({
                    where: { email: decodedToken.email },
                });
                if (user) {
                    userCache.set(decodedToken.email, user);
                }
            }
            return userCache.get(decodedToken.email);
        });
    }
    ;
    function authByGoogleToken(access_token) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticket = yield oAuth2client
                .verifyIdToken({
                idToken: access_token.replace("Bearer ", ""),
                audience: client_secret_json_1.default.web.client_id,
            })
                .catch(console.error); //TODO log error
            if (ticket) {
                let user = yield user_model_1.default.findOne({
                    where: { email: ticket.payload.email },
                });
                return user;
            }
        });
    }
    return {
        authByLocalPassword,
        authByGoogleToken,
        authByLocalToken
    };
}
exports.default = useAuthUtils;
//# sourceMappingURL=authUtil.js.map