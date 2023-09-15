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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const authUtil_1 = __importDefault(require("../../math-auth/build/authUtil"));
const dbUtil_1 = __importDefault(require("../../math-db/build/dbUtil"));
const index_1 = __importDefault(require("../../math-db/build/models/index"));
const enum_1 = require("../../math-common/build/enum");
var BoardType;
(function (BoardType) {
    BoardType[BoardType["LESSON"] = 0] = "LESSON";
    BoardType[BoardType["QUESTION"] = 1] = "QUESTION";
    BoardType[BoardType["ANSWER"] = 2] = "ANSWER";
})(BoardType || (BoardType = {}));
;
const authUtil = (0, authUtil_1.default)();
const db = (0, dbUtil_1.default)();
let app = (0, express_1.default)();
app.use(auth);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(body_parser_1.default.json({ limit: "10mb" }));
app.use(body_parser_1.default.urlencoded({
    limit: "10mb",
    extended: true,
    parameterLimit: 5000,
}));
function auth(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // omit authorization enforcement, when signing in.
        if (req.url.indexOf("/api/users?email") == 0) {
            next();
            return;
        }
        // verify authorization
        if (!(yield validateHeaderAuthentication(req, res))) {
            return;
        }
        next();
    });
}
/*verifies that authenitication header exists and the it denotes a valid user
if yes, set header userUUId
*/
function validateHeaderAuthentication(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.headers.authorization) {
            res = res.status(401).json("unauthorized");
            return false;
        }
        const user = yield authUtil.authByLocalToken(req.headers.authorization.toString());
        if (!user) {
            res = res.status(401).json("invalid token");
        }
        if (req.url.indexOf("/api/users") == 0) {
            res.json(user);
        }
        return true;
    });
}
app.get("/api/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // token already validate by interceptor. see validateHeaderAuthentication
    if (req.headers.authorization) {
        return res.status(200);
    }
    // by email/password
    const { email, password } = req.query;
    if (!email || !password) {
        return res.status(401).json("missing user or password");
    }
    const user = yield authUtil.authByLocalPassword(email, password);
    if (!user) {
        return res.status(401);
    }
    return res.status(200).json(user);
}));
// app.get(
//     "/api/users",
//     async (req: Request, res: Response): Promise<Response> => {
//         const { email, password } = req.query;
//         const user = await authUtil.authByLocalPassword(email as string, password as string);
//         if (!user) {
//             return res.status(401);
//         }
//         return res.status(200).json(user);
//     }
// );
// lesson
app.get("/api/lessons", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userUUId } = req.query;
    return res.status(200).json(yield db.getLessons(userUUId));
}));
//app.get("/lessons/:uuid", async (req: Request, res: Response): Promise<Response> => {
//    return res.status(200).json(db.getLesson(req.params.uuid));
//});
app.post("/lessons", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json(yield db.createLesson(req.body));
}));
// question
app.get("/questions/:lessonUUId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json(yield db.getQuestions(req.params.lessonUUId));
}));
app.get("/questions/:uuid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json(yield db.getQuestion(req.params.uuid));
}));
app.get("/lessons/:uuid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json(yield db.getLesson(req.params.uuid));
}));
app.post("/questions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json(yield db.createQuestion(req.body));
}));
// answer
app.get("/answers/:uuid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json(yield db.getAnswer(req.params.uuid));
}));
app.get("/answers/:questionUUId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json(yield db.getAnswers(req.params.uuid));
}));
app.post("/answers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json(yield db.createAnswer(req.body));
}));
// student lesson
app.get("/api/studentlessons/:lessonUUId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res
        .status(200)
        .json(yield db.getStudentLessons(req.params.lessonUUId));
}));
app.post("/api/studentlessons", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json(yield db.createStudentLesson(req.body));
}));
// notations
for (const boardType in Object.keys(BoardType)) {
    //if (!Number.isNaN(Number(boardType))) continue; // typescript retuen a list of keys
    // then the values, we need to get values only
    for (const notationType in enum_1.NotationType) {
        if (!Number.isNaN(Number(notationType)))
            continue;
        app.get(`/${boardType}${notationType}s`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            return res
                .status(200)
                .json(yield db.getNotations(boardType, notationType, req.params.uuid));
        }));
        app.post(`/${boardType}${notationType}s`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            return res
                .status(200)
                .json(yield db.createNotation(boardType, notationType, req.body));
        }));
    }
}
;
// Resets the database and launches the express app on :8081
index_1.default.sequelize.sync({ force: true }).then(() => {
    app.listen(8081, () => {
        console.log("listening to port localhost:8081");
        var spawn = require("child_process").spawn;
        var ls = spawn("cmd.exe", ["/c", "seed.bat"]);
        ls.stdout.on("data", function (data) {
            console.log("stdout: " + data);
        });
        ls.stderr.on("data", function (data) {
            console.log("stderr: " + data);
        });
        ls.on("exit", function (code) {
            console.log("child process exited with code " + code);
        });
    });
});
//# sourceMappingURL=app.js.map