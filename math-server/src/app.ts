import winston from "winston";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import crypto from "crypto";
import useAuthUtil from "../../math-auth/build/authUtil";
import useDb from "../../math-db/build/dbUtil";
import connection from "../../math-db/build/models/index";
import multer from "multer";
import fs from "fs";

const { exec } = require("child_process");

import {
    BoardTypeValues,
    NotationTypeValues,
} from "../../math-common/build/unions";
import { createTransport } from "nodemailer";
import path from "path";


var transporter = createTransport({
    service: "gmail",
    auth: {
        user: "mathboard16@gmail.com", ///TODO: move to env
        pass: "uhte keto xhzb fiuz",
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
app.use(auth);
app.use(cors());
app.use(express.urlencoded({ extended: true, limit: "3mb" })); 
app.use(express.json({ limit: "1mb" }));
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
const upload = multer({ storage });



// Handle upload
app.post(
    "/api/uploadImage",
    upload.single("photo"),
    async (
        req: any,
        res: Response,
        next: NextFunction
    ) => {
        
        // Delete file after some time
        setTimeout(() => {
            try {
                fs.unlinkSync(
                    path.join(__dirname + "/uploads/", req.file.filename)
                );
            }
            catch (err: any) {
                serverLogger.error({
                    message: "Error deleting file",
                    error: err.message,
                });
            }
        }, 60000); // Delete after 60 seconds

        return res.status(200).send(req.file.filename);
    }
)


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

async function auth(req: Request, res: Response, next: NextFunction) {

    if (req.url.indexOf("/api/log") == 0) { // omit logging
        return next();      
    }

    if (req.url.indexOf("/images") >= 0) { // omit image upload
        return next();
    }


    // omit authorization enforcement when signing in
    if (req.method === "POST" && req.url.indexOf("/api/auth") == 0) {
        next();
    }

    // omit authorization enforcement when registering
    else if (req.method === "POST" && req.url.indexOf("/api/users") == 0) {
        next();
    }

    // omit authorization enforcement for contact us
    else if (req.method === "POST" && req.url.indexOf("/api/contactus") == 0) {
        next();
    }

    else if (req.method === "POST" && req.url.indexOf("/api/uploadImage") == 0) {
        // omit upload from mobile
        next();
    }

    // verify authorization
    else if (!(await validateHeaderAuthentication(req, res, next))) {
        return;
    } else {
        next();
    }
}

/*verifies that authenitication header exists and  denotes a valid user
if yes, set header userUUId
*/
async function validateHeaderAuthentication(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<boolean> {
    if (!req.headers.authorization) {
        res = res.status(401).json("unauthorized");
        return false;
    }
    const user = await authUtil.authByLocalToken(
        req.headers.authorization.toString()
    );

    if (!user) {
        serverLogger.error(
            "Invalid token:" + req.headers.authorization.toString()
        );
        res = res.status(401).json("invalid token");
        return false;
    }

    if (req.url.indexOf("/api/auth") == 0) {
         res.status(200).json(user);
         return false; // Prevent further response
     }

    req.headers.userId = user?.id?.toString();

    return true;
}

// verify that the user is the same as the one in the body
app.all("/*", async function (req: Request, res, next) {

    if( req.method !== "PUT" && req.method !== "DELETE") {
        next();
        return;
    }

    const { uuid } = req.body; 
    if (!uuid) {
        next();
        return;
    }

    const userId = await db.getUserIdOfNotation(uuid, req.url);    
    
    const userFromHeader = await authUtil.authByLocalToken(
        req.headers.authorization!.toString()
    );

    if (userFromHeader?.userType === 'TEACHER' ||  userId === userFromHeader?.id) {
        next();
    }
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

app.post(
    "/api/users",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            req.body.password = authUtil.encryptPasssword(req.body.password);
            return res.status(200).json(await db.createUser(req.body));
        } catch (error) {
            next(error);
        }
    }
);

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
            if (uuid)
                return res
                    .status(200)
                    .json(await db.getQuestion(uuid as string));

            throw new Error(
                "either lessonUUId or questionUUId must be supplied"
            );
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
            return res.status(200).json(await db.createQuestion(req.body));
        } catch (err) {
            next(err);
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
                    await db.deleteNotation(
                        boardType,
                        notationType,
                        req.body.uuid
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

app.use(errorHandler);

let forceDbCreate =
    process.env.NODE_ENV === "development";

console.log("re create db =" + forceDbCreate);

connection.sequelize.sync({ force: forceDbCreate }).then(() => {
    const port = Number(process.env.API_PORT) || 17030;
    app.listen(port, () => {
        console.log("listening to port localhost:" + port);
    }).on("error", (e) => {
        console.log("Error: ", e.message);
    });
    if (forceDbCreate) {
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



