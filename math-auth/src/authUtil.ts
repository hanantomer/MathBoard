import jwt from "jsonwebtoken";
import  bcryptjs from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import clientSecretData from "../client_secret.json";
import {User} from "../../math-db/src/models/user.model";

const oAuth2client = new OAuth2Client(clientSecretData.web.client_id);
const userCache = new Map();

export default function useAuthUtils() {
    async function authByLocalPassword(email: string, password: string) {
        //TODO add caching
        let user = await User.findOne<User>({
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
            user.password = "";
            return user;
        }
        return null;
    }

    async function authByLocalToken(access_token: string) {
        let decodedToken: any = jwt.verify(
            access_token,
            clientSecretData.client_secret
        );
        // TODO - check expiration
        if (!userCache.get(decodedToken.email)) {
            userCache.set(
                decodedToken.email,
                await User.findOne({
                    where: { email: decodedToken.email },
                })
            );
        }
        return userCache.get(decodedToken.email);
    }

    async function authByGoogleToken(access_token: string) {
        const ticket: any = await oAuth2client
            .verifyIdToken({
                idToken: access_token.replace("Bearer ", ""),
                audience: clientSecretData.web.client_id,
            })
            .catch(console.error); //TODO log error

        if (ticket) {
            let user = await User.findOne({
                where: { email: ticket.payload.email },
            });
            return user;
        }
    }

    return {
        authByLocalPassword,
        authByGoogleToken,
        authByLocalToken
    }
}