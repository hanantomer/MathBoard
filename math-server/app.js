const express = require("express");
const cors = require("cors");
const finale = require("finale-rest");
const db = require("math-db/src/models/index");
const authMiddleware = require("math-auth/src/authMiddleware");
const userMiddleware = require("./userMiddleware");
const notationMiddleware = require("./notationMiddleware");

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

finale
    .resource({
        model: db.sequelize.models["Exercise"],
        endpoints: ["/exercises", "/exercises/:id"],
    })
    .use(authMiddleware);

finale
    .resource({
        model: db.sequelize.models["Symbol"],
        endpoints: ["/symbols", "/symbols/:id"],
    })
    .use(notationMiddleware);

finale.resource({
    model: db.sequelize.models["SignSymbol"],
    endpoints: ["/signsymbols", "/signymbols/:id"],
});

finale.resource({
    model: db.sequelize.models["NumberSymbol"],
    endpoints: ["/numbersymbols", "/numbersymbols/:id"],
});

// Resets the database and launches the express app on :8081
db.sequelize.sync({ force: true }).then(() => {
    app.listen(8081, () => {
        console.log("listening to port localhost:8081");
    });
});
