import { verify, sign } from "jsonwebtoken";
import { compare, hashSync } from "bcryptjs";
import { LoginTicket, OAuth2Client } from "google-auth-library";
import clientSecretData   from "./client_secret.json";
import User from "../../math-db/build/models/user.model";
import { UserAttributes } from "../../math-common/build/userTypes";
import winston from "winston";
import path from "path";

const oAuth2client = new OAuth2Client(clientSecretData.web.client_id);
const userCache = new Map<string, UserAttributes>()

const CACHE_CLEANUP_INTERVAL = 1000 * 60 * 60; // 1 hour

interface DecodedToken {
    email: string;
    exp: number;
    iat: number;
}

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: path.join(__dirname, "logs", "auth.log"),
        }),
    ],
});

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
                { expiresIn: '7d' }  
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

    async function authByToken(access_token: string): Promise<UserAttributes | null> {
        try {
            // Explicitly type the decoded token
            const decodedToken = verify(
                access_token,
                clientSecretData.client_secret
            ) as DecodedToken;

            // Check if token is expired
            const currentTimestamp = Math.floor(Date.now() / 1000);
            if (decodedToken.exp < currentTimestamp) {
                logger.error('Token expired');
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
                logger.error(
                    `decodedToken.email:${decodedToken.email} not found in user table`
                );
                return null;
            }

            // Update cache
            userCache.set(decodedToken.email, user);
            return user;

        } catch (error) {
            logger.error('Token verification failed: ' + error);
            return null;
        }
    }

    async function authByGoogleIdToken(
        idToken: string
    ): Promise<string | null> {
        const ticket: LoginTicket | null = await oAuth2client
            .verifyIdToken({
                idToken: idToken,
                audience: clientSecretData.web.client_id,
            })
            .catch((error) => {
                logger.error(`Google ID token verification failed: ${error}`);
                return null;
            });

        let access_token = sign(
            { email: ticket?.getPayload()!.email },
            clientSecretData.client_secret,
            { expiresIn: "14d" }
        );

        return access_token; // maybe return sub field from ticket.getPayload()
    }

    function validateToken(access_token: string): DecodedToken | null {
        try {
            const decodedToken = verify(
                access_token,
                clientSecretData.client_secret
            ) as DecodedToken;

            const currentTimestamp = Math.floor(Date.now() / 1000);
            if (decodedToken.exp < currentTimestamp) {
                logger.error('Token expired');
                return null;
            }
            return decodedToken;
        } catch (error) {
            logger.error('Token verification failed: ' + error);
            return null;
        }
    }

    async function getUserByToken(
        decodedToken: DecodedToken
    ): Promise<UserAttributes | null> {

        const currentTimestamp = Math.floor(Date.now() / 1000);

        // Check cache with expiration (1 hour)
        const cachedUser = userCache.get(decodedToken.email);
        if (cachedUser && currentTimestamp - decodedToken.iat < 3600) {
            return cachedUser;
        }

        // If not in cache or cache expired, fetch from DB
        const user = await User.findOne({
            where: { email: decodedToken.email },
        });

        if (!user) {
            logger.error(
                `decodedToken.email:${decodedToken.email} not found in user table`
            );
            return null;
        }

        // Update cache
        userCache.set(decodedToken.email, user);
        return user;
    }

    return {
        authByLocalPassword,
        authByGoogleIdToken,
        getUserByToken,
        validateToken,
        encryptPasssword
    }
}