const express = require("express");
const cors = require("cors");
const finale = require("finale-rest");
const db = require("math-db/src/models/index");
const authMiddleware = require("math-auth/src/authMiddleware");
const userMiddleware = require("./userMiddleware");
const exerciseMiddleware = require("./exerciseMiddleware");

let app = express();
app.use(cors());
app.use(express.json());

finale.initialize({
    app: app,
    sequelize: db.sequelize,
});

let userResource = finale.resource({
    model: db.sequelize.models["User"],
    endpoints: ["/users", "/users/:id"],
});
userResource.use(userMiddleware);
userResource.use(authMiddleware);

let exerciseResource = finale.resource({
    model: db.sequelize.models["Exercise"],
    endpoints: ["/exercises", "/exercises/:id"],
});
exerciseResource.use(authMiddleware);
exerciseResource.use(exerciseMiddleware);

let symbolResource = finale.resource({
    model: db.sequelize.models["Symbol"],
    endpoints: ["/symbols", "/symbols/:id"],
});
symbolResource.use(authMiddleware);
symbolResource.use(exerciseMiddleware);

finale.resource({
    model: db.sequelize.models["AccessLink"],
    endpoints: ["/accessLink", "/accessLink/:id"],
});

// Resets the database and launches the express app on :8081
db.sequelize.sync({ force: true }).then(() => {
    app.listen(8081, () => {
        console.log("listening to port localhost:8081");

        var spawn = require("child_process").spawn;
        var ls = spawn("cmd.exe", [
            "/c",
            "C:/dev/MathBoard/math-db/seeders/seed.bat",
        ]);

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
