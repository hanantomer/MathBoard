import { verify, sign } from "jsonwebtoken";
import { compare, hashSync } from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import clientSecretData   from "./client_secret.json";
import User from "../../math-db/build/models/user.model";
import { UserAttributes } from "../../math-common/build/userTypes";

const oAuth2client = new OAuth2Client(clientSecretData.web.client_id);
const userCache = new Map<string, UserAttributes>()

const CACHE_CLEANUP_INTERVAL = 1000 * 60 * 60; // 1 hour

interface DecodedToken {
    email: string;
    exp: number;
    iat: number;
}

export default function authUtils() {

    setInterval(() => {
        userCache.clear();
    }, CACHE_CLEANUP_INTERVAL);

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
                { expiresIn: '7d' }  // Maybe use a shorter period like 7 days
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

    async function authByLocalToken(access_token: string): Promise<UserAttributes | null> {
        try {
            // Explicitly type the decoded token
            const decodedToken = verify(
                access_token,
                clientSecretData.client_secret
            ) as DecodedToken;

            // Check if token is expired
            const currentTimestamp = Math.floor(Date.now() / 1000);
            if (decodedToken.exp < currentTimestamp) {
                console.error('Token expired');
                return null;
            }

            // Check cache with expiration (1 hour)
            const cachedUser = userCache.get(decodedToken.email);
            if (cachedUser && (currentTimestamp - decodedToken.iat) < 3600) {
                return cachedUser;
            }

            // If not in cache or cache expired, fetch from DB
            const user = await User.findOne({
                where: { email: decodedToken.email },
            });

            if (!user) {
                console.error(
                    `decodedToken.email:${decodedToken.email} not found in user table`
                );
                return null;
            }

            // Update cache
            userCache.set(decodedToken.email, user);
            return user;

        } catch (error) {
            console.error('Token verification failed:', error);
            return null;
        }
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