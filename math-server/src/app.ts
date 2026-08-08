import dotenv from "dotenv";
import path from "path";

// Prefer math-server/.env regardless of process.cwd() (IDE tasks often start elsewhere).
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import winston from "winston";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import crypto from "crypto";
import useAuthUtil from "../../math-auth/build/authUtil";
import useDb from "../../math-db/build/dbUtil";
import connection from "../../math-db/build/models/index";
import multer from "multer";
import { recognizeSketchFromImage, formatSketchOcrError, summarizeSketchOcrError } from "./services/sketchOcrService";
import { checkPracticeWork, coachPracticeWork } from "./services/practiceCheckService";
import {
    checkPracticeAiLimit,
    consumePracticeAiLimit,
    type PracticeAiSubjectKind,
} from "./services/guestPracticeRateLimit";
import type {
  PracticeCheckRequest,
  PracticeCoachRequest,
} from "../../math-common/build/practiceQuestionTypes";
import {
    PRACTICE_AI_LIMIT_ERROR,
} from "../../math-common/build/globals";

import { exec } from "child_process";

import {
    BoardTypeValues,
    NotationTypeValues,
} from "../../math-common/build/unions";
import { QuestionCreationAttributes } from "../../math-common/build/questionTypes";
import { createTransport } from "nodemailer";
import fs from "fs";



var transporter = createTransport({
    service: "gmail",
    auth: {
        user: "mathboard16@gmail.com", ///TODO: move to env
        pass: "pxyc xpqn eqdl yjuo",
    },
});

process.on('uncaughtException', (error: Error) => {
    serverLogger.error({
        message: 'Uncaught Exception',
        error: error.message,
        stack: error.stack
    });
    // Give time for logging before exiting
    setTimeout(() => {
        process.exit(1);
    }, 1000);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    serverLogger.error({
        message: 'Unhandled Rejection',
        reason: reason instanceof Error ? reason.message : reason,
        stack: reason instanceof Error ? reason.stack : undefined
    });
});

const authUtil = useAuthUtil();
const db = useDb();
let app = express();
app.use(validateAuth);
app.use(
    cors({
        exposedHeaders: ["X-Practice-AI-Remaining", "X-Practice-AI-Limit"],
    }),
);
app.use(express.urlencoded({ extended: true, limit: "8mb" })); 
app.use(express.json({ limit: "8mb" }));
const staticDir = path.join(__dirname, "uploads");
app.use("/images",  express.static(staticDir)); // Serve static files from uploads directory

const serverLogger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
            ({
                timestamp,
                level,
                path,
                message,
                error,
                origin,
                parent,
                sql,
                sqlMessage,
                fields,
            }) => {
                return `${timestamp} [${level.toUpperCase()}]: ${path},  
            ${message}, 
            ${error ? error : ""},   
            ${origin ? origin : ""},
            ${parent ? parent : ""},
            ${sql ? sql : ""}, fields: 
            ${fields ? JSON.stringify(fields) : ""},
            ${sqlMessage ? sqlMessage : ""} }`;
            }
        )
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, "logs", "server.log"),
        }),
    ],
});

const apiLogsDir = path.join(__dirname, "logs");
try {
    fs.mkdirSync(apiLogsDir, { recursive: true });
} catch {
    // ignore
}

const boardClearLogger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(apiLogsDir, "board-clear.log"),
        }),
    ],
});

const practiceAiUsageLogger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(apiLogsDir, "practice-ai-usage.log"),
        }),
    ],
});

type BoardClearWindow = {
    firstAt: number;
    lastAt: number;
    count: number;
    sampleUuid?: string;
};

// Heuristic: many deletes in a short window likely means "clear board".
const clearWindows = new Map<string, BoardClearWindow>();
const CLEAR_WINDOW_MS = 10_000;
const CLEAR_DELETE_THRESHOLD = 25;

function recordNotationDeleteForClearHeuristic(
    userId: string | undefined,
    lessonUUId: string | null,
    uuid: string | undefined,
    url: string,
) {
    if (!userId || !lessonUUId || !uuid) {
        return;
    }
    // Only lessons; avoid noise from questions/answers.
    if (url.toLowerCase().indexOf("/api/lesson") !== 0) {
        return;
    }

    const key = `${lessonUUId}:${userId}`;
    const now = Date.now();
    const existing = clearWindows.get(key);

    if (!existing || now - existing.firstAt > CLEAR_WINDOW_MS) {
        clearWindows.set(key, { firstAt: now, lastAt: now, count: 1, sampleUuid: uuid });
        return;
    }

    existing.lastAt = now;
    existing.count += 1;
    existing.sampleUuid = existing.sampleUuid ?? uuid;

    if (existing.count >= CLEAR_DELETE_THRESHOLD) {
        boardClearLogger.info({
            event: "lesson_board_clear_suspected",
            lessonUUId,
            userId,
            deletesInWindow: existing.count,
            windowMs: now - existing.firstAt,
            sampleUuid: existing.sampleUuid,
        });
        clearWindows.delete(key);
    }
}

const clientLogger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({
           filename: path.join(__dirname, "logs", "client.log")
        }),
    ],
});


const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});


app.post(
    "/api/log",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.body.level) {
                clientLogger.log({
                    level: req.body.level,
                    message: req.body.message,
                });
            } else {
                clientLogger.info(req.body.message);
            }
            return res.status(200).send("ok");
        } catch (err) {
            next(err);
        }
})

async function validateAuth(req: Request, res: Response, next: NextFunction) {

    if (req.url.indexOf("/api/log") == 0) { // omit logging
        return next();      
    }

    if (req.url.indexOf("/images") >= 0) { // omit image upload
        return next();
    }


    // omit authorization enforcement when signing in
    if (req.method === "POST" && req.url.indexOf("/api/auth") == 0) {
        return next();
    }

    if (req.method === "POST" && req.url.indexOf("/api/gauth") == 0) {
        return next();
    }

    // omit authorization enforcement when registering or validating user
    else if (req.method === "POST" && req.url.indexOf("/api/users") == 0) {
        return next();
    }

    // omit authorization enforcement for contact us
    else if (
        req.method === "POST" &&
        req.url.indexOf("/api/contactus") == 0
    ) {
        return next();
    }

    // Guest practice: public reads + rate-limited AI (check/coach)
    const guestPractice = await tryAllowGuestPractice(req, res);
    if (guestPractice === "allowed") {
        return next();
    }
    if (guestPractice === "rejected") {
        return;
    }

    // verify authorization (authenticated lesson/Q/A and other APIs)
    if (!(await validateHeaderAuthentication(req, res, next))) {
        return;
    }
    return next();
}

type GuestPracticeGate = "allowed" | "rejected" | "skip";

/**
 * Allow unauthenticated practice bank reads and rate-limited check/coach.
 * Returns skip when the request is not a guest practice path (or has a token).
 */
async function tryAllowGuestPractice(
    req: Request,
    res: Response,
): Promise<GuestPracticeGate> {
    if (req.headers.authorization) {
        return "skip";
    }

    const pathOnly = req.url.split("?")[0];

    if (
        req.method === "GET" &&
        (pathOnly.indexOf("/api/practice-questions") === 0 ||
            pathOnly === "/api/practice-ai-quota")
    ) {
        return "allowed";
    }

    if (req.method === "GET" && /^\/api\/question/i.test(pathOnly)) {
        const uuid = req.query.uuid as string | undefined;
        if (!uuid) {
            return "skip";
        }
        try {
            if (await db.isPracticeQuestion(uuid)) {
                return "allowed";
            }
        } catch (err) {
            serverLogger.error({
                message: "isPracticeQuestion failed for guest read",
                error: err instanceof Error ? err.message : String(err),
            });
        }
        return "skip";
    }

    const aiMatch = pathOnly.match(
        /^\/api\/practice-questions\/([^/]+)\/(check|coach)$/,
    );
    if (req.method === "POST" && aiMatch) {
        const guestKey = resolveGuestKey(req);
        const limit = checkPracticeAiLimit(guestKey, "guest");
        if (!limit.allowed) {
            res.status(429).json({
                error: PRACTICE_AI_LIMIT_ERROR,
                message: limit.message,
                limit: limit.limit,
                remaining: 0,
            });
            return "rejected";
        }
        const aiReq = req as PracticeAiRequest;
        aiReq.practiceAiKey = guestKey;
        aiReq.practiceAiKind = "guest";
        return "allowed";
    }

    return "skip";
}

type PracticeAiRequest = Request & {
  practiceAiKey?: string;
  practiceAiKind?: PracticeAiSubjectKind;
  guestAiKey?: string;
};

function resolveGuestKey(req: Request): string {
    const headerId = req.headers["x-guest-id"];
    if (typeof headerId === "string" && headerId.trim().length >= 8) {
        return `guest:${headerId.trim()}`;
    }
    const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        "unknown";
    return `ip:${ip}`;
}

/** Attach and enforce daily AI quota for guests or registered users. */
function enforcePracticeAiQuota(
    req: Request,
    res: Response,
    action: "check" | "coach" = "check",
): boolean {
    const aiReq = req as PracticeAiRequest;
    let key = aiReq.practiceAiKey;
    let kind = aiReq.practiceAiKind;

    if (!key) {
        const userId = req.headers.userId as string | undefined;
        if (userId) {
            key = `user:${userId}`;
            kind = "user";
        } else {
            key = resolveGuestKey(req);
            kind = "guest";
        }
        aiReq.practiceAiKey = key;
        aiReq.practiceAiKind = kind;
    }

    const limit = checkPracticeAiLimit(key, kind!);
    if (!limit.allowed) {
        practiceAiUsageLogger.info({
            event: "denied",
            day: new Date().toISOString().slice(0, 10),
            action,
            kind,
            subject: key,
            questionUUId: req.params.questionUUId,
            remaining: 0,
            limit: limit.limit,
            used: limit.limit,
        });
        res.status(429).json({
            error: PRACTICE_AI_LIMIT_ERROR,
            message: limit.message,
            limit: limit.limit,
            remaining: 0,
        });
        return false;
    }
    return true;
}

function recordPracticeAiUse(
    req: Request,
    res: Response,
    action: "check" | "coach",
) {
    const aiReq = req as PracticeAiRequest;
    if (!aiReq.practiceAiKey || !aiReq.practiceAiKind) return;
    const used = consumePracticeAiLimit(
        aiReq.practiceAiKey,
        aiReq.practiceAiKind,
    );
    res.setHeader("X-Practice-AI-Remaining", String(used.remaining));
    res.setHeader("X-Practice-AI-Limit", String(used.limit));
    practiceAiUsageLogger.info({
        event: "consume",
        day: new Date().toISOString().slice(0, 10),
        action,
        kind: aiReq.practiceAiKind,
        subject: aiReq.practiceAiKey,
        questionUUId: req.params.questionUUId,
        remaining: used.remaining,
        limit: used.limit,
        used: used.limit - used.remaining,
    });
    return used;
}

function resolvePracticeAiSubject(req: Request): {
    key: string;
    kind: PracticeAiSubjectKind;
} {
    const aiReq = req as PracticeAiRequest;
    if (aiReq.practiceAiKey && aiReq.practiceAiKind) {
        return { key: aiReq.practiceAiKey, kind: aiReq.practiceAiKind };
    }
    const userId = req.headers.userId as string | undefined;
    if (userId) {
        return { key: `user:${userId}`, kind: "user" };
    }
    return { key: resolveGuestKey(req), kind: "guest" };
}

/*verifies that authenitication header exists and denotes a valid user
if yes, set header userUUId
*/
async function validateHeaderAuthentication(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<boolean> {
    if (!req.headers.authorization) {
        serverLogger.error(`No authorization header found for request: ${req.url}`);
        res = res.status(401).json("unauthorized");
        return false;
    }

    const access_token = req.headers.authorization;
    const decodedToken = authUtil.validateToken(access_token);

    if (!decodedToken) {
        serverLogger.error(
            "Invalid token:" + req.headers.authorization.toString()
        );
        res = res.status(401).json("invalid token");
        return false;
    }
    
    let user = await authUtil.getUserByToken(
        decodedToken
    );
    
    if (req.url.indexOf("/api/auth") == 0) {
         res.status(200).json(user);
         return false; // Prevent further response
     }

    req.headers.userId = user?.id?.toString();

    return true;
}

function isLessonNotationUrl(url: string): boolean {
    return /\/api\/lesson[a-z]+s(\/|$|\?)/.test(url);
}

function isBoardEntityUrl(url: string): boolean {
    return /^\/api\/(lessons|questions)(\?|$|\/)/.test(url);
}

async function validateBoardEntityMutation(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    if (req.method !== "PUT" && req.method !== "DELETE") {
        next();
        return;
    }

    const userId = Number.parseInt(req.headers.userId as string);
    if (!userId) {
        res.status(401).json("unauthorized");
        return;
    }

    const { uuid } = req.body as { uuid?: string };
    if (!uuid) {
        res.status(400).json("uuid is required");
        return;
    }

    if (/^\/api\/lessons/.test(req.url)) {
        if (await db.canUserManageLesson(userId, uuid)) {
            next();
            return;
        }
        res.status(403).json("not authorized to manage lesson");
        return;
    }

    if (/^\/api\/questions/.test(req.url)) {
        if (await db.canUserManageQuestion(userId, uuid)) {
            next();
            return;
        }
        res.status(403).json("not authorized to manage question");
        return;
    }

    next();
}

async function validateLessonNotationMutation(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const userId = Number.parseInt(req.headers.userId as string);
    const user = await db.getUserById(userId);
    if (!user) {
        res.status(401).json("unauthorized");
        return;
    }

    let lessonUUId: string | null = null;
    if (req.method === "POST") {
        lessonUUId = (req.body?.parentUUId as string | undefined) ?? null;
    } else {
        const uuid = req.body?.uuid as string | undefined;
        if (uuid) {
            lessonUUId = await db.getLessonUUIdOfNotation(uuid, req.url);
        }
    }

    if (!lessonUUId) {
        res.status(400).json("missing lesson");
        return;
    }

    if (await db.canUserEditLessonBoard(user, lessonUUId)) {
        next();
        return;
    }

    res.status(403).json("not authorized to edit lesson");
}

// Verify notation mutations: lesson boards require edit authorization;
// other boards allow the notation owner or any teacher.
app.all("/*", async function (req: Request, res, next) {
    if (req.method !== "PUT" && req.method !== "DELETE" && req.method !== "POST") {
        next();
        return;
    }

    if (isBoardEntityUrl(req.url)) {
        await validateBoardEntityMutation(req, res, next);
        return;
    }

    if (isLessonNotationUrl(req.url)) {
        await validateLessonNotationMutation(req, res, next);
        return;
    }

    const { uuid } = req.body;
    if (!uuid) {
        next();
        return;
    }

    const notationOwnerId = await db.getUserIdOfNotation(uuid, req.url);
    const userFromHeader = await db.getUserById(
        Number.parseInt(req.headers.userId as string),
    );

    if (
        userFromHeader?.userType === "TEACHER" ||
        userFromHeader?.userType === "BOTH" ||
        notationOwnerId === userFromHeader?.id
    ) {
        next();
        return;
    }

    res.status(403).json("not authorized to edit notation");
});

app.post(
    "/api/contactus",
    async (req: Request, res: Response, next: NextFunction) => {
        let mailOptions = {
            from: req.body.email,
            to: "mathboard16@gmail.com",
            subject: "Message from:" + req.body.name + ":" + req.body.email,
            text: req.body.message,
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return res.status(500);
            } else {
                console.log("Email sent: " + info.response);
                return res.status(200);
            }
        });
    }
);

// auth by email/password via login screen
app.post(
    "/api/auth",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        // by token - already validated by auth interceptor
        if (req.headers.userId) {
            return;
        }

        // by email/password
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(401).json("missing user or password");
        }

        try {
            const user = await authUtil.authByLocalPassword(
                email as string,
                password as string
            );
            if (!user) {
                return res.status(401).json("invalid user or password");
            }
            return res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    }
);


// get idToken from google ui and response with LoginTiket if valid
app.post(
    "/api/gauth",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
                
        const { idToken } = req.body;

        try {
            const ticket = await authUtil.authByGoogleIdToken(
                idToken as string,
            );
            if (!ticket) {
                return res.status(401).json("invalid idToken");
            }
            return res.status(200).json(ticket);
        } catch (err) {
            next(err);
        }
    }
);


app.post(
    "/api/users",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            req.body.nonprod =
                process.env.NODE_ENV === "development" ||
                process.env.NODE_ENV === "test";
            req.body.password = !!req.body.password
                ? req.body.password= authUtil.encryptPasssword(req.body.password)
                : req.body.password;
            return res.status(200).json(await db.saveUser(req.body));
        } catch (error) {
            next(error);
        }
    }
);

app.get(
    "/api/users",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            let { email } = req.query;
            if (!email) {
                return res
                    .status(200)
                    .json(await db.getUserById(Number.parseInt(req.headers.userId as string)));
            }
            return res.status(200).json(await db.getUserByEmail(email as string));
                   
        } catch (error) {
            next(error);
        }
    }
);

// gets nothing but counts on "validateAuth" interceptor to validate token and return user
app.get(
    "/api/auth",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            return res.status(200).json(res.get("user"));
        } catch (error) {
            next(error);
        }
    }
);

app.post("/api/auth/send-reset-password-mail", async (req, res) => {
    try {
        const { email, origin } = req.body;

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Store the token in the database with an expiration
        await db.storeResetToken(email, resetToken);

        // Send reset email
        await sendResetEmail(
            email,
            `${origin}/reset-password?token=${resetToken}` 
        );

        res.status(200).json({ message: "Reset email sent" });
    } catch (error) {
        res.status(500).json({
            error: "Failed to process password reset request",
        });
    }
});


app.post('/api/auth/reset-password', async (req, res) => {
  try {
    let { token, password } = req.body;
    
    const resetToken = await db.getResetToken(token);
      
    if (!resetToken) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    password = authUtil.encryptPasssword(password);      
    await db.updatePassword(token, password,);
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// student
app.get(
    "/api/students",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            const { uuid } = req.query;

            if (!uuid)
                throw new Error(
                    "invalid arguments user uuid  must be supplied"
                );

            return res.status(200).json(await db.getUser(uuid as string));
        } catch (err) {
            next(err);
        }
    }
);

// lesson
app.get(
    "/api/lessons",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            const { userUUId, lessonUUId } = req.query;
            if (userUUId)
                return res
                    .status(200)
                    .json(await db.getLessons(userUUId as string));
            if (lessonUUId)
                return res
                    .status(200)
                    .json(await db.getLesson(lessonUUId as string));

            throw new Error(
                "invalid arguments either userUUId or lessonUUId must be supplied"
            );
        } catch (err) {
            next(err);
        }
    }
);

app.post(
    "/api/lessons",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            return res.status(200).json(await db.createLesson(req.body));
        } catch (err) {
            next(err);
        }
    }
);

app.put(
    "/api/lessons",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            const userId = Number.parseInt(req.headers.userId as string);
            const { uuid, name } = req.body as {
                uuid?: string;
                name?: string;
            };
            if (!uuid || !name?.trim()) {
                return res.status(400).json("uuid and name are required");
            }
            if (!(await db.canUserManageLesson(userId, uuid))) {
                return res.status(403).json("not authorized to update lesson");
            }
            const lesson = await db.updateLesson(uuid, name.trim());
            if (!lesson) {
                return res.status(404).json("lesson not found");
            }
            return res.status(200).json(lesson);
        } catch (err) {
            next(err);
        }
    }
);

app.delete(
    "/api/lessons",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            const userId = Number.parseInt(req.headers.userId as string);
            const { uuid } = req.body as { uuid?: string };
            if (!uuid) {
                return res.status(400).json("uuid is required");
            }
            if (!(await db.canUserManageLesson(userId, uuid))) {
                return res.status(403).json("not authorized to delete lesson");
            }
            const deleted = await db.deleteLesson(uuid);
            if (!deleted) {
                return res.status(404).json("lesson not found");
            }
            return res.status(200).json({ ok: true });
        } catch (err) {
            next(err);
        }
    }
);

// question

app.get(
    "/api/questions",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            const { uuid, lessonUUId } = req.query;
            if (lessonUUId)
                return res
                    .status(200)
                    .json(await db.getQuestions(lessonUUId as string));
            if (uuid) {
                const question = await db.getQuestion(uuid as string);
                if (!question) {
                    return res.status(404).json("question not found");
                }
                return res.status(200).json(db.formatQuestionForClient(question));
            }

            throw new Error("lessonUUId or question uuid must be supplied");
        } catch (err) {
            next(err);
        }
    }
);

app.post(
    "/api/questions",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            const body = req.body as QuestionCreationAttributes;
            if (!body.lesson?.uuid) {
                return res
                    .status(400)
                    .json("lesson is required for lesson questions");
            }
            return res.status(200).json(await db.createQuestion(body));
        } catch (err) {
            next(err);
        }
    }
);

app.put(
    "/api/questions",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            const userId = Number.parseInt(req.headers.userId as string);
            const { uuid, name } = req.body as {
                uuid?: string;
                name?: string;
            };
            if (!uuid || !name?.trim()) {
                return res.status(400).json("uuid and name are required");
            }
            if (!(await db.canUserManageQuestion(userId, uuid))) {
                return res
                    .status(403)
                    .json("not authorized to update question");
            }
            const question = await db.updateQuestion(uuid, name.trim());
            if (!question) {
                return res.status(404).json("question not found");
            }
            return res.status(200).json(question);
        } catch (err) {
            next(err);
        }
    }
);

app.delete(
    "/api/questions",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            const userId = Number.parseInt(req.headers.userId as string);
            const { uuid } = req.body as { uuid?: string };
            if (!uuid) {
                return res.status(400).json("uuid is required");
            }
            if (!(await db.canUserManageQuestion(userId, uuid))) {
                return res
                    .status(403)
                    .json("not authorized to delete question");
            }
            const deleted = await db.deleteQuestion(uuid);
            if (!deleted) {
                return res.status(404).json("question not found");
            }
            return res.status(200).json({ ok: true });
        } catch (err) {
            next(err);
        }
    }
);

// practice question bank (extension table; stem on questions)

app.get(
    "/api/practice-ai-quota",
    (
        req: Request,
        res: Response,
    ): Response => {
        const { key, kind } = resolvePracticeAiSubject(req);
        const status = checkPracticeAiLimit(key, kind);
        return res.status(200).json({
            remaining: status.remaining,
            limit: status.limit,
            kind,
        });
    },
);

app.get(
    "/api/practice-questions",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            const { subject } = req.query;
            return res
                .status(200)
                .json(
                    await db.getPracticeQuestions(
                        subject ? (subject as string) : undefined
                    )
                );
        } catch (err) {
            next(err);
        }
    }
);

app.get(
    "/api/practice-questions/:questionUUId",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            const item = await db.getPracticeQuestion(
                req.params.questionUUId
            );
            if (!item) {
                return res.status(404).json("practice question not found");
            }
            return res.status(200).json(item);
        } catch (err) {
            next(err);
        }
    }
);

app.post(
    "/api/practice-questions",
    async (
        _req: Request,
        res: Response,
    ): Promise<Response> => {
        return res
            .status(403)
            .json("practice questions are system-managed");
    }
);

app.put(
    "/api/practice-questions/:questionUUId",
    async (
        _req: Request,
        res: Response,
    ): Promise<Response> => {
        return res
            .status(403)
            .json("practice questions are system-managed");
    }
);

app.delete(
    "/api/practice-questions/:questionUUId",
    async (
        _req: Request,
        res: Response,
    ): Promise<Response> => {
        return res
            .status(403)
            .json("practice questions are system-managed");
    }
);

app.post(
    "/api/practice-questions/:questionUUId/check",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            if (!enforcePracticeAiQuota(req, res, "check")) {
                return;
            }
            const questionUUId = req.params.questionUUId;
            const body = req.body as PracticeCheckRequest;
            const studentWork =
                typeof body?.studentWork === "string" ? body.studentWork : "";
            const problemImageBase64 =
                typeof body?.problemImageBase64 === "string"
                    ? body.problemImageBase64
                    : undefined;
            if (!questionUUId) {
                return res.status(400).json({ error: "questionUUId is required" });
            }
            const result = await checkPracticeWork(
                questionUUId,
                studentWork,
                problemImageBase64,
            );
            const used = recordPracticeAiUse(req, res, "check");
            return res.status(200).json({
                ...result,
                remaining: used?.remaining,
                limit: used?.limit,
            });
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Practice check failed";
            serverLogger.error({
                message: "Practice check failed",
                error: message,
                path: "/api/practice-questions/:questionUUId/check",
            });
            if (message.includes("template not found")) {
                return res.status(404).json({ error: message });
            }
            return res.status(502).json({
                error: "Practice check failed",
                message,
            });
        }
    }
);

app.post(
    "/api/practice-questions/:questionUUId/coach",
    async (
        req: Request,
        res: Response,
    ): Promise<Response | undefined> => {
        try {
            if (!enforcePracticeAiQuota(req, res, "coach")) {
                return;
            }
            const questionUUId = req.params.questionUUId;
            const body = req.body as PracticeCoachRequest;
            const studentWork =
                typeof body?.studentWork === "string" ? body.studentWork : "";
            const problemImageBase64 =
                typeof body?.problemImageBase64 === "string"
                    ? body.problemImageBase64
                    : undefined;
            if (!questionUUId) {
                return res.status(400).json({ error: "questionUUId is required" });
            }
            const result = await coachPracticeWork(
                questionUUId,
                studentWork,
                problemImageBase64,
            );
            const used = recordPracticeAiUse(req, res, "coach");
            return res.status(200).json({
                ...result,
                remaining: used?.remaining,
                limit: used?.limit,
            });
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Practice coach failed";
            serverLogger.error({
                message: "Practice coach failed",
                error: message,
                path: "/api/practice-questions/:questionUUId/coach",
            });
            if (message.includes("template not found")) {
                return res.status(404).json({ error: message });
            }
            return res.status(502).json({
                error: "Practice coach failed",
                message,
            });
        }
    }
);

// answer

app.get(
    "/api/answers",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            const { uuid, questionUUId } = req.query;
            if (questionUUId)
                return res
                    .status(200)
                    .json(await db.getAnswers(questionUUId as string));

            if (uuid)
                return res.status(200).json(await db.getAnswer(uuid as string));

            throw new Error("either uuid or questionUUId must be supplied");
        } catch (err) {
            next(err);
        }
    }
);

app.post(
    "/api/answers",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            return res.status(200).json(await db.createAnswer(req.body));
        } catch (err) {
            next(err);
        }
    }
);

// student lesson

app.get(
    "/api/studentlessons",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            const { userUUId, lessonUUId } = req.query;

            if (lessonUUId)
                return res
                    .status(200)
                    .json(
                        await db.getStudentLesson(
                            userUUId as string,
                            lessonUUId as string
                        )
                    );

            return res
                .status(200)
                .json(await db.getStudentLessons(userUUId as string));
        } catch (err) {
            next(err);
        }
    }
);

app.post(
    "/api/studentlessons",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            return res.status(200).json(await db.createStudentLesson(req.body));
        } catch (err) {
            next(err);
        }
    }
);

// notations
BoardTypeValues.forEach((boardType) => {
    NotationTypeValues.forEach((notationType) => {

        app.get(
            `/api/${boardType.toLowerCase()}${notationType.toLowerCase()}/:uuid`,
            async (
                req: Request,
                res: Response,
                next: NextFunction
            ): Promise<Response | undefined> => {
                try {
                    const uuid  = req.params.uuid;

                    if (!uuid) {
                        next("invlid uuid:" + uuid);
                        return;
                    }

                    let notations: any = "";

                    notations = await db.getNotation(
                        boardType,
                        notationType,
                        uuid as string
                    );

                    return res.status(200).json(notations);
                } catch (err) {
                    next(err);
                    return;
                }
            }
        );

        app.get(
            `/api/${boardType.toLowerCase()}${notationType.toLowerCase()}s`,
            async (
                req: Request,
                res: Response,
                next: NextFunction
            ): Promise<Response | undefined> => {
                try {
                    const { uuid } = req.query;

                    if (!uuid) {
                        next("invlid uuid:" + uuid);
                        return;
                    }

                    let notations: any = "";

                    notations = await db.getNotations(
                        boardType,
                        notationType,
                        uuid as string
                    );

                    return res.status(200).json(notations);
                } catch (err) {
                    next(err);
                    return;
                }
            }
        );

        app.post(
            `/api/${boardType.toLowerCase()}${notationType.toLowerCase()}s`,
            async (
                req: Request,
                res: Response,
                next: NextFunction
            ): Promise<Response | undefined> => {
                try {
                    return res
                        .status(200)
                        .json(
                            await db.createNotation(
                                boardType,
                                notationType,
                                req.body
                            )
                        );
                } catch (err) {
                    next(err);
                }
            }
        );

        app.put(
            `/api/${boardType.toLowerCase()}${notationType.toLowerCase()}s`,
            async (
                req: Request,
                res: Response,
                next: NextFunction
            ): Promise<Response | undefined> => {
                try {
                    await db.updateNotation(
                        boardType,
                        notationType,
                        req.body.uuid,
                        req.body
                    );
                    return res.status(200).send();
                } catch (err) {
                    next(err);
                }
            }
        );

        app.delete(
            `/api/${boardType.toLowerCase()}${notationType.toLowerCase()}s`,
            async (
                req: Request,
                res: Response,
                next: NextFunction
            ): Promise<Response | undefined> => {
                try {
                    const uuid = req.body?.uuid as string | undefined;
                    const lessonUUId = uuid
                        ? await db.getLessonUUIdOfNotation(uuid, req.url)
                        : null;
                    recordNotationDeleteForClearHeuristic(
                        req.headers.userId as string | undefined,
                        lessonUUId,
                        uuid,
                        req.url,
                    );

                    if (!uuid) {
                        return res.status(400).json("invalid uuid");
                    }

                    await db.deleteNotation(
                        boardType,
                        notationType,
                        uuid
                    );
                    return res.status(200).send();
                } catch (err) {
                    next(err);
                }
            }
        );
    });
});

async function sendResetEmail(email: string, resetLink: string) {
    const mailOptions = {
        from: "mathboard16@gmail.com",
        to: email,
        subject: "MathBoard Password Reset",
        text: `You requested a password reset. Please click the following link to reset your password:\n\n${resetLink}\n\nIf you didn't request this, please ignore this email.`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error("Failed to send reset email");
    }
}


const errorHandler = (
    err: Error & { fields: string, original: any, parent: any },
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const isSequelizeError = !!(err as any).sql;
    
    serverLogger.error({
        message: 'Server error occurred',
        type: isSequelizeError ? 'Database Error' : 'Application Error',
        error: err.message,
        path: req.path,
        fields: err.fields,
        original: err.original,
        parent: err.parent,
        method: req.method,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        sql: isSequelizeError ? (err as any).sql : undefined,
        sqlMessage: isSequelizeError ? (err as any).original?.sqlMessage : undefined
    });

    // Send appropriate response
    if (isSequelizeError) {
        return res.status(503).json({
            error: 'Database operation failed',
            message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }

    return res.status(500).json({
        error: 'Server error occurred',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
};

app.post(
    "/api/ocr/sketch",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { imageBase64 } = req.body ?? {};
            if (!imageBase64 || typeof imageBase64 !== "string") {
                return res.status(400).json({ error: "imageBase64 is required" });
            }

            const symbol = await recognizeSketchFromImage(imageBase64);
            return res.status(200).json({ symbol });
        } catch (err) {
            const message = summarizeSketchOcrError(err);
            serverLogger.error({
                message: "Sketch OCR failed",
                error: formatSketchOcrError(err),
                path: "/api/ocr/sketch",
            });
            return res.status(502).json({
                error: "Sketch OCR failed",
                message,
            });
        }
    },
);

app.use(errorHandler);

let forceDbCreate =
    process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

console.log("re create db =" + forceDbCreate);

connection.sequelize.sync({ force: forceDbCreate }).then(() => {
    const port = Number(process.env.API_PORT) || 17030;
    app.listen(port, () => {
        console.log("listening to port localhost:" + port);
    }).on("error", (e) => {
        console.log("Error: ", e.message);
    });
    if (process.env.NODE_ENV === "development") {
        exec(
            "C:/dev/MathBoard/math-db/seeders/seed.bat",
            (err: any, stdout: any, stderr: any) => {
                if (err) {
                    console.log(err);
                    // node couldn't execute the command
                    return;
                }

                // the *entire* stdout and stderr (buffered)
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
            }
        );
    }
});



