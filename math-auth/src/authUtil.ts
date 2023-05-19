const db = require("../../math-db/build/models/index");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const clientSecretData = require("../client_secret.json");
const oAuth2client = new OAuth2Client(clientSecretData.web.client_id);

export default class AuthUtils {

    userCache = new Map();

    async authByLocalPassword(email: string, password: string) {
        //TODO add caching
        let user = await db.sequelize.models["User"].findOne({
            where: { email: email },
            attributes: { include: ["password"] },
        });
        if (!user) {
            return null;
        }
        // validate password
        let passwordMatched =
            !!user && (await bcryptjs.compare(password, user.password));
        if (passwordMatched) {
            let access_token = jwt.sign(
                { email: user.email },
                clientSecretData.client_secret,
                { expiresIn: 86400 * 30 }
            );
            user.access_token = access_token;
            user.password = null;
            return user;
        }
        return null;
    }
    async authByLocalToken(access_token: string) {
        let decodedToken = jwt.verify(
            access_token,
            clientSecretData.client_secret
        );
        // TODO - check expiration
        if (!this.userCache.get(decodedToken.email)) {
            this.userCache.set(
                decodedToken.email,
                await db.sequelize.models["User"].findOne({
                    where: { email: decodedToken.email },
                })
            );
        }
        return this.userCache.get(decodedToken.email);
    }
    
    async authByGoogleToken(access_token: string) {
        const ticket = await oAuth2client
            .verifyIdToken({
                idToken: access_token.replace("Bearer ", ""),
                audience: clientSecretData.web.client_id,
            })
            .catch(console.error); //TODO log error
 
        if (!!ticket) {
            let user = await db.sequelize.models["User"].findOne({
                where: { email: ticket.payload.email },
            });
            return user;
        }
    }
}