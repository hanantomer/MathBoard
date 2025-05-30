import { verify, sign } from "jsonwebtoken";
import { compare, hash, hashSync } from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import clientSecretData   from "./client_secret.json";
import User from "../../math-db/build/models/user.model";
import { UserAttributes } from "../../math-common/build/userTypes";

const oAuth2client = new OAuth2Client(clientSecretData.web.client_id);
const userCache = new Map<string, UserAttributes>();

export default function authUtils() {

    function encryptPasssword(password: string): string {
        return hashSync(password, 10);
    }
    
    async function authByLocalPassword(
        email: string,
        password: string
    ): Promise<UserAttributes | null> {
        
        if (!email || !password) return null;

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
            !!user && (await compare(password, user.password));

        if (passwordMatched) {
            let access_token = sign(
                { email: user.email },
                clientSecretData.client_secret,
                { expiresIn: 86400 * 30 }
            );

            user.access_token = access_token;

            await User.update<User>(
                { access_token: access_token },
                { where: { id: user.id } }
            );    

            user.password = "";
            return user;
        }
        return null;
    };

    async function authByLocalToken(access_token: string) : Promise<UserAttributes | null>{
        let decodedToken: any = verify(
            access_token,
            clientSecretData.client_secret
        );
        // TODO - check expiration
        if (!userCache.get(decodedToken.email)) {

            let user = await User.findOne({
                where: { email: decodedToken.email },
            });

            if (!user) {

                console.error(
                    `decodedToken.email:${decodedToken.email} not found in user table`
                );
                return null;
            }
            userCache.set(decodedToken.email, user);
        }

        return userCache.get(decodedToken.email) || null;
    };

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
        authByLocalToken,
        encryptPasssword
    }
}